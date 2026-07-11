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
 * response returns ONLY the matched profile's tagline and description — the
 * FireFight/Refine/Build/Optimize NAME itself is deliberately never included
 * either, by design decision: that naming stays internal-only, never shown
 * to a visitor even for their own match. The other three profiles' text,
 * the bucket label, and any internal methodology name are never included in
 * the JSON response and must stay that way.
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

// ── Bot signals: honeypot + timing ───────────────────────────────────────────
// These are FLAGS, not hard blocks. A hidden honeypot field can get filled by
// a browser's own autofill (this happened in testing — Chrome filled it even
// though it's off-screen and autocomplete="off"), and a fast, autofill-assisted
// real visitor can beat a fixed time threshold. Either used to hard-block and
// silently fake a success with no email sent — which meant a real lead's
// submission could vanish with no error and no notification to the team.
// The actual spam gates are the session-based math captcha, the DNS-validated
// email check, and the content filter below — all still hard requirements.
// A submission that only trips these two soft signals still goes through and
// still emails the team, just flagged, so nothing real gets silently lost.
$suspicious = false;
$suspicious_reasons = [];

// Honeypot: bots fill every field, including ones a human never sees.
if (!empty($_POST['hp_field_9x2'])) {
    $suspicious = true;
    $suspicious_reasons[] = 'honeypot field was filled';
}

// Timing: genuine bots usually submit near-instantly. Lowered from a hard
// 4s block to a 2s flag threshold specifically because autofill can make a
// real visitor's fill-and-submit time very short.
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

// ── Bot protection: Math challenge (session-based) — hard requirement ────────
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

// ── Bot signal: content in the optional "note" field ──────────────────────────
// A URL or one long unbroken string in the note is more often a real client
// pasting their own site/tool link than a bot — flag it, don't drop it.
$temp_note = $_POST['note'] ?? '';
if (
    preg_match('/https?:\/\/|www\./i', $temp_note) ||
    preg_match('/[a-zA-Z]{35,}/', $temp_note)
) {
    $suspicious = true;
    $suspicious_reasons[] = 'note field contains a URL or unbroken long string';
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
            'description' => "You have both a defined process and a manageable time cost — this is closer to fine-tuning than fixing. Automation here is about removing friction and freeing up the last bit of manual effort, not solving a broken workflow. Even solid setups like this usually still have room for effective automation — small frictions worth removing, processes worth tightening, and time, money, or other resources worth freeing up that are easy to overlook when things already work.",
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
            'description' => "Sie haben sowohl einen definierten Ablauf als auch einen überschaubaren Zeitaufwand – hier geht es eher um Feinschliff als um Reparatur. Automatisierung bedeutet hier, Reibung zu reduzieren und den letzten manuellen Aufwand abzubauen, nicht einen kaputten Prozess zu retten. Auch bei einer so soliden Ausgangslage gibt es meist noch Raum für sinnvolle Automatisierung – kleine Reibungspunkte, die sich beseitigen lassen, Abläufe, die sich weiter verschlanken lassen, sowie Zeit, Geld oder andere Ressourcen, die sich freisetzen lassen und bei bereits funktionierenden Prozessen leicht übersehen werden.",
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
if ($suspicious) {
    $subject = "⚠ " . $subject; // flagged, not blocked — still reaches the inbox
}

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

// ── Human-readable glossary + full matrix diagram for the internal email ─────
// This is the ONE place all four quadrants and both bucket meanings are ever
// written out together — safe here because this email never leaves this
// script and never reaches a browser. Exists so BUCKET/PROFILE aren't just
// bare jargon in the inbox.
$bucket_glossary = "lead = strongest fit (real time cost, process gap, wants a practical outcome)  |  "
                  . "warm = business but a softer fit (e.g. process already fairly solid, or just exploring/comparing)  |  "
                  . "other = not a business decision-maker — these never reach this email; they see a short thank-you on the page instead";

function build_matrix_diagram($profileKey) {
    $cells = [
        'fireFight' => 'FireFight — urgent time cost,     no/partial process',
        'refine'    => 'Refine     — urgent time cost,     full process',
        'build'     => 'Build      — manageable time cost, no/partial process',
        'optimize'  => 'Optimize   — manageable time cost, full process',
    ];
    $lines = [];
    foreach ($cells as $key => $desc) {
        $marker = ($key === $profileKey) ? '>>> ' : '    ';
        $tag    = ($key === $profileKey) ? '   <-- THIS SUBMISSION' : '';
        $lines[] = $marker . $desc . $tag;
    }
    return implode("\n", $lines);
}

$body = "BUCKET:  $bucket\n"
      . "PROFILE: " . $profile['name'] . " [$profileKey]\n"
      . "Source: $source\n"
      . ($suspicious ? "FLAGGED: " . implode('; ', $suspicious_reasons) . " (not blocked — verify before replying)\n" : "")
      . "\n"

      . "--- What BUCKET means ---\n"
      . $bucket_glossary . "\n\n"

      . "--- Full matrix — where this submission lands ---\n"
      . "(rows: time cost, urgent = high or hard-to-say/spread-across-team; columns: whether a defined process exists)\n"
      . build_matrix_diagram($profileKey) . "\n\n"

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
    // Only the ONE matched profile's tagline + description go back to the
    // browser. No name/label (the FireFight/Refine/Build/Optimize naming
    // stays fully internal — never sent to any visitor, not even for their
    // own match), no bucket, no other profiles, no methodology name.
    echo json_encode([
        "status" => "ok",
        "profile" => [
            "tagline"     => $profile['tagline'],
            "description" => $profile['description'],
        ],
    ]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "reason" => "mail_failed"]);
}
