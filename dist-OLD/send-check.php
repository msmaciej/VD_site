<?php
/**
 * send-check.php
 * VortexDeep Fit Check — validate, score, notify the team, reveal on-site.
 *
 * Place in /public so Astro copies it to dist/ unchanged. Works on standard PHP
 * shared hosting including HostPoint. No session store beyond the math captcha,
 * no database.
 *
 * FLOW (on-site reveal — restored):
 * On submit this endpoint validates the submission, scores it server-side,
 * emails the TEAM the full internal breakdown (bucket, profile, matrix, answers,
 * AI-READY block; flagged if a soft bot signal tripped), and returns ONLY the
 * matched profile's tagline + description (+ shared disclaimer + CTA) to the
 * browser, which shows it immediately. So a real lead lands in the inbox on
 * every genuine submission, and the visitor sees their result without leaving
 * the page.
 *
 * LEAK RULE (unchanged): the profile NAME, the bucket, the other three profiles'
 * copy and the scoring matrix are computed here but NEVER returned to the
 * browser — only the matched tagline + description reach the page. See
 * fitcheck-lib.php.
 *
 * The math captcha stays a HARD requirement: this endpoint emails the team and
 * reveals a result on every call, so the captcha is what stops it being driven
 * at scale by a bot or a competitor harvesting the four blurbs.
 *
 * SETUP — only this line needs editing:
 */
$recipient = "info@vortexdeep.ch";

require_once __DIR__ . '/fitcheck-lib.php';

header('Content-Type: application/json');

// ── Bot signals: honeypot + timing (soft flags — carried into the team email) ─
$suspicious = false;
$suspicious_reasons = [];

if (!empty($_POST['hp_field_9x2'])) {
    $suspicious = true;
    $suspicious_reasons[] = 'honeypot field was filled';
}

$load_time  = (int)($_POST['form_load_time'] ?? 0);
$time_taken = time() - $load_time;
if ($load_time === 0 || $time_taken < 2) {
    $suspicious = true;
    $suspicious_reasons[] = 'submitted unusually fast (' . $time_taken . 's)';
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit("Method not allowed");
}

// ── Math challenge (session-based) — hard requirement ────────────────────────
session_start();
$math_answer = intval($_POST['math_answer'] ?? -1);
$correct_sum = isset($_SESSION['vd_math_sum']) ? intval($_SESSION['vd_math_sum']) : -999;

if ($math_answer !== $correct_sum || $correct_sum === -999) {
    http_response_code(400);
    echo json_encode(["status" => "error", "reason" => "security_check"]);
    exit;
}
unset($_SESSION['vd_math_sum']); // single-use — prevents replay

// ── Bot signal: content in the optional "note" field ─────────────────────────
$temp_note = $_POST['note'] ?? '';
if (
    preg_match('/https?:\/\/|www\./i', $temp_note) ||
    preg_match('/[a-zA-Z]{35,}/', $temp_note)
) {
    $suspicious = true;
    $suspicious_reasons[] = 'note field contains a URL or unbroken long string';
}

// ── Sanitise ─────────────────────────────────────────────────────────────────
function clean($value) {
    return htmlspecialchars(trim($value ?? ""), ENT_QUOTES, "UTF-8");
}

$lang    = ($_POST["lang"] ?? "en") === "de" ? "de" : "en";
$name    = clean($_POST["name"]    ?? "");
$company = clean($_POST["company"] ?? "");
$email   = filter_var(trim($_POST["email"] ?? ""), FILTER_SANITIZE_EMAIL);
$note    = substr(clean($_POST["note"] ?? ""), 0, 1000);
$source  = clean($_POST["source"]  ?? "vortexdeep.ch quick check");

$role     = clean($_POST["role"]     ?? "");
$category = clean($_POST["category"] ?? "");
$followup = clean($_POST["followup"] ?? "");
$time     = clean($_POST["time"]     ?? "");
$process  = clean($_POST["process"]  ?? "");
$goal     = clean($_POST["goal"]     ?? "");

// Email: format check
if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "reason" => "invalid_email"]);
    exit;
}

// Email: domain DNS check — catches fake / non-existent domains
$email_domain = substr(strrchr($email, "@"), 1);
if (!checkdnsrr($email_domain, "MX") && !checkdnsrr($email_domain, "A")) {
    http_response_code(400);
    echo json_encode(["status" => "error", "reason" => "invalid_email"]);
    exit;
}

// role guard — only business ever reaches the gate; this is a public endpoint.
if ($role !== "business") {
    http_response_code(400);
    echo json_encode(["status" => "error", "reason" => "not_applicable"]);
    exit;
}

// ── Load config-sourced copy (generated from config.json at build) ───────────
$uiFile = __DIR__ . '/fitcheck-profiles.gen.php';
if (!is_file($uiFile)) {
    http_response_code(500);
    echo json_encode(["status" => "error", "reason" => "profiles_missing"]);
    error_log("send-check.php: generated include not found at $uiFile");
    exit;
}
require $uiFile; // defines $PROFILES, $RESULT_SHARED, $CONFIRM_UI, $FITCHECK_THEME

// ── Score server-side (leak-safe: names/bucket/matrix stay here) ─────────────
$profileKey = vd_calc_profile_key($time, $process);
$bucket     = vd_calc_bucket('business', $category, $time, $process, $goal);

$haveProfile = isset($PROFILES[$lang][$profileKey])
    && is_array($PROFILES[$lang][$profileKey])
    && !empty($PROFILES[$lang][$profileKey]['tagline'])
    && !empty($PROFILES[$lang][$profileKey]['description']);

if (!$haveProfile) {
    http_response_code(500);
    echo json_encode(["status" => "error", "reason" => "profiles_invalid"]);
    error_log("send-check.php: profiles missing/incomplete for [$lang][$profileKey]");
    exit;
}
$profile = $PROFILES[$lang][$profileKey];

// ── Notify the team — full internal breakdown, reply-to the visitor ──────────
$d = [
    'e'   => $email,   'n'  => $name,     'c' => $company, 'o' => $note,
    'l'   => $lang,    'src'=> $source,   'cat' => $category, 'fu' => $followup,
    't'   => $time,    'p'  => $process,  'g' => $goal,
    's'   => $suspicious ? 1 : 0,
    'sr'  => implode('; ', $suspicious_reasons),
];
list($mailSubject, $mailBody) = vd_build_internal_email($d, $profile, $bucket, $profileKey);
$headers = "From: noreply@vortexdeep.ch\r\n"
         . "Reply-To: " . $email . "\r\n"
         . "Content-Type: text/plain; charset=UTF-8";

// Reveal the result even if the team mail hiccups — the visitor did their part,
// and they still have the direct mailto CTA. A failure is logged for us.
if (!@mail($recipient, $mailSubject, $mailBody, $headers)) {
    error_log("send-check.php: team notification mail() failed for [$lang][$bucket] $email");
}

// ── Reveal — matched tagline + description + shared disclaimer/CTA only ───────
$resultTag  = $CONFIRM_UI[$lang]['resultTag']    ?? ($lang === 'de' ? 'Ihr Ergebnis' : 'Your result');
$disclaimer = $RESULT_SHARED[$lang]['disclaimer'] ?? '';
$ctaLabel   = $RESULT_SHARED[$lang]['ctaLabel']  ?? ($lang === 'de' ? 'Lassen Sie uns kurz darüber sprechen' : "Let's talk it through");

echo json_encode([
    "status"      => "ok",
    "resultTag"   => $resultTag,
    "tagline"     => $profile['tagline'],
    "description" => $profile['description'],
    "disclaimer"  => $disclaimer,
    "ctaLabel"    => $ctaLabel,
]);
