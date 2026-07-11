<?php
/**
 * send-check.php
 * VortexDeep Quick Check — form handler, bot protection, and server-side scoring.
 *
 * Place in /public so Astro copies it to dist/ unchanged.
 * Works on standard PHP shared hosting including HostPoint.
 *
 * SECURITY / PRIVACY NOTE — read before editing:
 * The bucket (lead/warm/other) and the matched profile (FireFight/Refine/
 * Build/Optimize) are both computed here, server-side, from the RAW answers
 * submitted by the client. The client never computes or transmits either
 * value — it only sends role/category/followup/time/process/goal. This
 * response returns ONLY the single matched profile's public-facing text
 * (name/tagline/description). The other three profiles, the bucket label,
 * and any internal methodology name are never included in the JSON response
 * and must stay that way.
 *
 * CONTENT SYNC NOTE:
 * $PROFILES below is a hand-maintained duplicate of the "profiles" section
 * in src/content/fitcheck/config.json (itself editable in Tina, see
 * tina/fitcheck-schema.ts). It is duplicated deliberately — this script runs
 * on the PHP host independently of the Astro build, and the whole point of
 * scoring server-side is that the non-matching profiles must never reach the
 * browser, so this file can't simply read Tina's content JSON at request
 * time from a public path (a public path would itself be fetchable). If you
 * edit profile copy in Tina, mirror the change here too.
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

// ── Sanitise ──────────────────────────────────────────────────────────────────
function clean($value) {
    return htmlspecialchars(trim($value ?? ""), ENT_QUOTES, "UTF-8");
}

$lang    = ($_POST["lang"] ?? "en") === "de" ? "de" : "en";
$name    = clean($_POST["name"]    ?? "");
$company = clean($_POST["company"] ?? "");
$email   = filter_var(trim($_POST["email"] ?? ""), FILTER_SANITIZE_EMAIL);
$note    = clean($_POST["note"]    ?? "");
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

// The normal client flow only ever shows the gate form (and therefore only
// ever posts here) for role=business — consultant/curious see the shortClose
// screen instead and never submit. Guard anyway, since this is a public
// endpoint and the raw POST could be replayed with a different role.
if ($role !== "business") {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(["status" => "error", "reason" => "not_applicable"]);
    exit;
}

// ── Server-side bucket — internal lead-quality signal, used only in the
//    team's own email, never returned to the client. ────────────────────────
function calc_bucket($role, $category, $time, $process, $goal) {
    if ($role !== 'business') return 'other';
    $hasRealTimeCost = in_array($time, ['high', 'mid', 'unsure'], true);
    $hasMultiPain    = $category === 'several';
    $wantsOutcome    = in_array($goal, ['solve', 'clarity'], true);
    $processGap      = $process !== 'full';
    if (($hasRealTimeCost || $hasMultiPain) && $processGap && $wantsOutcome) return 'lead';
    return 'warm';
}
$bucket = calc_bucket($role, $category, $time, $process, $goal);

// ── Server-side profile — FireFight / Refine / Build / Optimize, derived
//    from time × process. time=unsure is treated as the urgent row (same as
//    "high"), same as time=high. ─────────────────────────────────────────────
function calc_profile_key($time, $process) {
    $isUrgent    = in_array($time, ['high', 'unsure'], true);
    $fullProcess = $process === 'full';
    if ($isUrgent) {
        return $fullProcess ? 'refine' : 'fireFight';
    }
    return $fullProcess ? 'optimize' : 'build';
}
$profileKey = calc_profile_key($time, $process);

// ── Profile copy (EN/DE) — see CONTENT SYNC NOTE above ────────────────────────
$PROFILES = [
    'en' => [
        'fireFight' => [
            'name' => 'FireFight',
            'tagline' => "You're spending real hours firefighting, with no clear process to fall back on.",
            'description' => "Right now, this work eats a real chunk of your week — and without a defined process, it likely falls on whoever has time, which makes it inconsistent as well as slow. This is usually the fastest area to see a return from automating, because the fix doesn't require redesigning how you work — it just needs the parts that already repeat to stop needing a person.",
        ],
        'refine' => [
            'name' => 'Refine',
            'tagline' => "You already have a process — it's just not fast enough.",
            'description' => "You've done the harder work already: there's a defined way this gets done. The cost now is mostly speed and consistency, not structure. That's usually a more contained automation project than it looks — the logic already exists, it just needs to run without someone executing it by hand every time.",
        ],
        'build' => [
            'name' => 'Build',
            'tagline' => "The time cost is manageable for now — but there's no real process underneath it.",
            'description' => "This isn't costing you many hours yet, which is exactly why it's easy to leave as-is. But without a defined process, it tends to get worse as volume grows, not better. Worth thinking about before it becomes the next FireFight.",
        ],
        'optimize' => [
            'name' => 'Optimize',
            'tagline' => "This is already working reasonably well.",
            'description' => "You have both a defined process and a manageable time cost — this is closer to fine-tuning than fixing. Automation here is about removing friction and freeing up the last bit of manual effort, not solving a broken workflow.",
        ],
    ],
    'de' => [
        'fireFight' => [
            'name' => 'FireFight',
            'tagline' => "Sie investieren im Moment echte Stunden ins Feuerlöschen – ohne klaren Ablauf im Hintergrund.",
            'description' => "Dieser Bereich kostet aktuell einen spürbaren Teil Ihrer Woche – und da kein definierter Ablauf existiert, übernimmt es meist, wer gerade Zeit hat. Das macht es zusätzlich uneinheitlich. Das ist in der Regel der Bereich, in dem sich Automatisierung am schnellsten auszahlt, denn es braucht keine grundlegende Neugestaltung – nur die bereits wiederkehrenden Schritte müssen nicht mehr manuell erledigt werden.",
        ],
        'refine' => [
            'name' => 'Refine',
            'tagline' => "Sie haben bereits einen Ablauf – er ist nur noch nicht schnell genug.",
            'description' => "Die schwierigere Arbeit ist bereits getan: Es gibt einen definierten Ablauf. Der Aufwand liegt jetzt vor allem bei Geschwindigkeit und Konsistenz, nicht bei der Struktur. Das ist meist ein überschaubareres Automatisierungsprojekt, als es aussieht – die Logik existiert bereits, sie muss nur nicht mehr jedes Mal von Hand ausgeführt werden.",
        ],
        'build' => [
            'name' => 'Build',
            'tagline' => "Der Zeitaufwand ist im Moment überschaubar – aber es fehlt ein echter Ablauf dahinter.",
            'description' => "Aktuell kostet das noch nicht viele Stunden, was es leicht macht, es einfach so zu belassen. Ohne definierten Ablauf wird es mit wachsendem Volumen aber eher schlimmer als besser. Das lohnt sich, bevor daraus das nächste FireFight wird.",
        ],
        'optimize' => [
            'name' => 'Optimize',
            'tagline' => "Das läuft bereits vergleichsweise gut.",
            'description' => "Sie haben sowohl einen definierten Ablauf als auch einen überschaubaren Zeitaufwand – hier geht es eher um Feinschliff als um Reparatur. Automatisierung bedeutet hier, Reibung zu reduzieren und den letzten manuellen Aufwand abzubauen, nicht einen kaputten Prozess zu retten.",
        ],
    ],
];

$profile = $PROFILES[$lang][$profileKey];

// ── Build internal email ──────────────────────────────────────────────────────
$subjects = [
    "lead"  => "★ Strong fit — VortexDeep Fit Check",
    "warm"  => "◎ Warm lead — VortexDeep Fit Check",
    "other" => "○ Interest noted — VortexDeep Fit Check",
];
$subject = $subjects[$bucket] ?? "New submission — VortexDeep Fit Check";

$category_labels = [
    "comms"     => "Inquiries, messages & customer support",
    "sales"     => "Sales pipeline & lead follow-up",
    "docs"      => "Documents, invoices, contracts & forms",
    "ops"       => "Internal approvals, scheduling & onboarding",
    "reporting" => "Reporting & data aggregation",
    "content"   => "Content, marketing & e-commerce flows",
    "several"   => "Multiple areas simultaneously",
];

$time_labels = [
    "high"   => "More than 5 hours per week",
    "mid"    => "1-5 hours per week",
    "low"    => "Less than 1 hour per week",
    "unsure" => "Spread across the team (hard to quantify)",
];

$process_labels = [
    "none"    => "No defined process — whoever has time handles it",
    "partial" => "Some rules exist but inconsistently followed",
    "full"    => "Defined process — needs to run faster",
];

$goal_labels = [
    "solve"   => "Practical workflow to reduce the manual work",
    "clarity" => "Better visibility for decision-making",
    "explore" => "Understanding what is possible before committing",
    "compare" => "Seeing how others have approached this",
];

function label($map, $key) {
    return isset($map[$key]) ? $map[$key] : $key;
}

$body = "BUCKET:  $bucket\n"
      . "PROFILE: " . $profile['name'] . " [$profileKey]\n"
      . "Source: $source\n\n"

      . "--- Contact ---\n"
      . "Email:   $email\n"
      . "Name:    $name\n"
      . "Company: $company\n"
      . "Note:    $note\n\n"

      . "--- Fit Check answers ---\n"
      . "Role:      business\n"
      . "Category:  " . label($category_labels, $category) . "\n"
      . "Follow-up: $followup\n"
      . "Time:      " . label($time_labels, $time) . "\n"
      . "Process:   " . label($process_labels, $process) . "\n"
      . "Goal:      " . label($goal_labels, $goal) . "\n\n"

      . "--- AI READY ---\n"
      . "bucket:        $bucket\n"
      . "profile:       $profileKey\n"
      . "role:          business\n"
      . "category:      " . label($category_labels, $category) . "\n"
      . "followup:      $followup\n"
      . "time_per_week: " . label($time_labels, $time) . "\n"
      . "process:       " . label($process_labels, $process) . "\n"
      . "goal:          " . label($goal_labels, $goal) . "\n"
      . "name:          $name\n"
      . "company:       $company\n"
      . "note:          $note\n";

$headers = "From: noreply@vortexdeep.ch\r\n"
         . "Reply-To: $email\r\n"
         . "Content-Type: text/plain; charset=UTF-8";

$sent = mail($recipient, $subject, $body, $headers);

header('Content-Type: application/json');
if ($sent) {
    // Only the ONE matched profile's public-facing text goes back to the
    // browser. No bucket, no other profiles, no methodology name.
    echo json_encode([
        "status" => "ok",
        "profile" => [
            "name"        => $profile['name'],
            "tagline"     => $profile['tagline'],
            "description" => $profile['description'],
        ],
    ]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "reason" => "mail_failed"]);
}
