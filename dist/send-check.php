<?php
/**
 * send-check.php
 * VortexDeep Fit Check — STAGE 1 of 2: validate + issue a confirmation link.
 *
 * Place in /public so Astro copies it to dist/ unchanged. Works on standard PHP
 * shared hosting including HostPoint. No session store, no database.
 *
 * WHAT CHANGED (verify-then-reveal / "path B"):
 * This endpoint no longer returns the result to the browser and no longer
 * emails the team. It validates the submission, then emails the VISITOR a
 * one-time, self-expiring, HMAC-signed link. The result is only revealed —
 * and the team is only notified — once the visitor clicks that link
 * (confirm.php). So the address has to be real AND theirs before anyone sees
 * a result or a lead lands in the inbox.
 *
 * Why this is safe to do statelessly on Hostpoint: the signed token carries the
 * (already validated) answers and contact fields. Nothing is stored here; the
 * token is the state. See fitcheck-lib.php for the signing details.
 *
 * The math captcha stays a HARD requirement precisely because this endpoint now
 * sends mail to a visitor-supplied address — the captcha is what stops it being
 * driven as a mass-mailer.
 *
 * SETUP — only this line needs editing:
 */
$recipient = "info@vortexdeep.ch"; // (kept for parity; the team mail is sent from confirm.php)

require_once __DIR__ . '/fitcheck-lib.php';

header('Content-Type: application/json');

// Signing secret must be present, or confirmation links can't be trusted.
if (empty($GLOBALS['VD_HMAC_SECRET'])) {
    http_response_code(500);
    echo json_encode(["status" => "error", "reason" => "config_missing"]);
    error_log("send-check.php: VD_HMAC_SECRET missing — cannot issue links");
    exit;
}

// ── Bot signals: honeypot + timing (soft flags, carried into the token) ──────
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

// ── Build the signed confirmation token ──────────────────────────────────────
// Short keys keep the token compact. The result is NOT computed here — the
// answers travel in the token and confirm.php scores them at reveal time, so
// the profile/bucket logic runs in exactly one place per request.
$payload = [
    'v'   => 1,
    'e'   => $email,
    'n'   => $name,
    'c'   => $company,
    'o'   => $note,
    'l'   => $lang,
    'src' => $source,
    'cat' => $category,
    'fu'  => $followup,
    't'   => $time,
    'p'   => $process,
    'g'   => $goal,
    's'   => $suspicious ? 1 : 0,
    'sr'  => implode('; ', $suspicious_reasons),
];
$token = vd_token_sign($payload, $GLOBALS['VD_HMAC_SECRET']);
$link  = vd_base_url() . '/confirm.php?t=' . rawurlencode($token);

// ── Confirmation-email copy (single-sourced from config.json via the
//    generated include; {{LINK}} is substituted here). ─────────────────────
$uiFile = __DIR__ . '/fitcheck-profiles.gen.php';
if (!is_file($uiFile)) {
    http_response_code(500);
    echo json_encode(["status" => "error", "reason" => "profiles_missing"]);
    error_log("send-check.php: generated include not found at $uiFile");
    exit;
}
require $uiFile; // defines $PROFILES, $RESULT_SHARED, $CONFIRM_UI, $FITCHECK_THEME

if (!isset($CONFIRM_UI[$lang]['emailSubject'], $CONFIRM_UI[$lang]['emailBody'])) {
    http_response_code(500);
    echo json_encode(["status" => "error", "reason" => "profiles_invalid"]);
    error_log("send-check.php: CONFIRM_UI missing email copy for [$lang]");
    exit;
}

$mailSubject = $CONFIRM_UI[$lang]['emailSubject'];
// emailBody uses " | " as a line separator (same convention as the CMS content
// fields) and {{LINK}} as the placeholder for the confirmation URL.
$mailBody = str_replace(
    ['{{LINK}}', ' | '],
    [$link, "\n\n"],
    $CONFIRM_UI[$lang]['emailBody']
);

$headers = "From: noreply@vortexdeep.ch\r\n"
         . "Reply-To: info@vortexdeep.ch\r\n"
         . "Content-Type: text/plain; charset=UTF-8";

$sent = mail($email, $mailSubject, $mailBody, $headers);

if ($sent) {
    // No result, no profile, no bucket — nothing to capture here. The browser
    // just learns the link is on its way.
    echo json_encode(["status" => "sent"]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "reason" => "mail_failed"]);
}
