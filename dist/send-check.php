<?php
/**
 * send-check.php
 * VortexDeep Quick Check — form handler with bot protection.
 *
 * Place in /public so Astro copies it to dist/ unchanged.
 * Works on standard PHP shared hosting including HostPoint.
 *
 * SETUP — only this line needs editing:
 */
$recipient = "info@vortexdeep.ch";

// ── Bot protection layer 1: Honeypot ─────────────────────────────────────────
// Bots fill in hidden fields. Real users never see this field.
if (!empty($_POST['website_url'])) {
    // Silent fake success — don't tell the bot it was blocked
    header('Content-Type: application/json');
    echo json_encode(["status" => "ok"]);
    exit;
}

// ── Bot protection layer 2: Time trap ────────────────────────────────────────
// Real humans take more than 4 seconds to fill a form. Bots submit instantly.
$load_time  = (int)($_POST['form_load_time'] ?? 0);
$time_taken = time() - $load_time;
if ($load_time === 0 || $time_taken < 4) {
    header('Content-Type: application/json');
    echo json_encode(["status" => "ok"]); // Silent fake success
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit("Method not allowed");
}

// ── Bot protection layer 3: Math challenge (session-based) ───────────────────
session_start();
$math_answer = intval($_POST['math_answer'] ?? -1);
$correct_sum = isset($_SESSION['vd_math_sum']) ? intval($_SESSION['vd_math_sum']) : -999;

if ($math_answer !== $correct_sum || $correct_sum === -999) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(["status" => "error", "reason" => "security_check"]);
    exit;
}
// Clear session immediately — prevents replay attacks
unset($_SESSION['vd_math_sum']);

// ── Bot protection layer 4: Content filtering ─────────────────────────────────
// Block URLs in the note field, and gibberish (very long unbroken strings)
$temp_note = $_POST['note'] ?? '';
if (
    preg_match('/https?:\/\/|www\./i', $temp_note) ||
    preg_match('/[a-zA-Z]{35,}/', $temp_note)
) {
    header('Content-Type: application/json');
    echo json_encode(["status" => "ok"]); // Silent fake success
    exit;
}

// ── Sanitise and validate ────────────────────────────────────────────────────
function clean($value) {
    return htmlspecialchars(trim($value ?? ""), ENT_QUOTES, "UTF-8");
}

$name    = clean($_POST["name"]    ?? "");
$company = clean($_POST["company"] ?? "");
$email   = filter_var(trim($_POST["email"] ?? ""), FILTER_SANITIZE_EMAIL);
$note    = clean($_POST["note"]    ?? "");
$source  = clean($_POST["source"]  ?? "vortexdeep.ch quick check");
$bucket  = clean($_POST["bucket"]  ?? "lead");

// Email: format check
if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(["status" => "error", "reason" => "invalid_email"]);
    exit;
}

// Email: domain DNS check — catches fake / non-existent domains
$email_domain = substr(strrchr($email, "@"), 1);
if (!checkdnsrr($email_domain, "MX") && !checkdnsrr($email_domain, "A")) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(["status" => "error", "reason" => "invalid_email"]);
    exit;
}

// ── Build email ───────────────────────────────────────────────────────────────
$subjects = [
    "lead"  => "★ Strong fit — VortexDeep Quick Check",
    "warm"  => "◎ Warm lead — VortexDeep Quick Check",
    "other" => "○ Interest noted — VortexDeep Quick Check",
];
$subject = $subjects[$bucket] ?? "New submission — VortexDeep Quick Check";

$pain    = clean($_POST["pain"]    ?? "");
$time    = clean($_POST["time"]    ?? "");
$process = clean($_POST["process"] ?? "");
$goal    = clean($_POST["goal"]    ?? "");

$bucket_labels = [
    "lead"  => "Strong fit",
    "warm"  => "Warm lead",
    "other" => "Interest noted",
];

$body = "BUCKET: " . ($bucket_labels[$bucket] ?? "Unknown") . "\n"
      . "Source: $source\n\n"
      . "--- Contact ---\n"
      . "Email:   $email\n"
      . "Name:    $name\n"
      . "Company: $company\n"
      . "Note:    $note\n\n"
      . "--- Quiz answers ---\n"
      . "Pain area:         $pain\n"
      . "Time cost:         $time\n"
      . "Process ownership: $process\n"
      . "Goal:              $goal\n";

$headers = "From: noreply@vortexdeep.ch\r\n"
         . "Reply-To: $email\r\n"
         . "Content-Type: text/plain; charset=UTF-8";

$sent = mail($recipient, $subject, $body, $headers);

header('Content-Type: application/json');
if ($sent) {
    echo json_encode(["status" => "ok"]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "reason" => "mail_failed"]);
}
