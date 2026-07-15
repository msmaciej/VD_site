<?php
/**
 * fitcheck-lib.php
 * VortexDeep Fit Check — shared server-side library.
 *
 * Required by BOTH send-check.php (issues a confirmation link) and confirm.php
 * (verifies the link, reveals the result, notifies the team). Everything that
 * used to live only in send-check.php and would otherwise have to be duplicated
 * in confirm.php lives here instead, so the scoring, the label maps, and the
 * internal-email format can never drift between the two endpoints.
 *
 * PRIVACY / LEAK NOTE — unchanged from before, still enforced:
 * The bucket (lead/warm/other) and the profile key (fireFight/refine/build/
 * optimize) are computed here, server-side, from the RAW answers only. The
 * profile NAME, the bucket, the other three profiles' copy, and the scoring
 * matrix never reach the browser. confirm.php reveals ONLY the matched
 * profile's tagline + description. Keep it that way.
 *
 * NOTHING in this file echoes when the file is requested directly over HTTP —
 * it only defines functions. public/.htaccess also denies direct access to it
 * (defence in depth).
 */

if (!defined('VD_FITCHECK_LIB')) {
    define('VD_FITCHECK_LIB', true);

    // ── Shared secret ────────────────────────────────────────────────────────
    // Loaded from fitcheck-secret.php (co-located, __DIR__-relative). That file
    // is deliberately NOT in version control (it is a signing key) but IS in the
    // deployment set. If it is missing, we fail loud rather than sign with a
    // predictable/empty key — a forgeable token would let anyone reveal a result
    // without owning the address, which is the whole thing we are preventing.
    $vd_secret_file = __DIR__ . '/fitcheck-secret.php';
    if (!is_file($vd_secret_file)) {
        // Callers check VD_HMAC_SECRET before use and return a clean 500.
        $GLOBALS['VD_HMAC_SECRET'] = '';
        error_log('fitcheck-lib.php: signing secret not found at ' . $vd_secret_file);
    } else {
        require $vd_secret_file; // defines $VD_HMAC_SECRET
        $GLOBALS['VD_HMAC_SECRET'] = isset($VD_HMAC_SECRET) ? (string)$VD_HMAC_SECRET : '';
    }

    // ── Token lifetime ───────────────────────────────────────────────────────
    if (!defined('VD_TOKEN_TTL')) {
        define('VD_TOKEN_TTL', 30 * 60); // 30 minutes
    }
}

/** URL-safe base64 (no padding) — keeps tokens clean in a query string. */
function vd_b64url_encode($bin) {
    return rtrim(strtr(base64_encode($bin), '+/', '-_'), '=');
}
function vd_b64url_decode($txt) {
    $txt = strtr($txt, '-_', '+/');
    $pad = strlen($txt) % 4;
    if ($pad) $txt .= str_repeat('=', 4 - $pad);
    return base64_decode($txt, true);
}

/**
 * Sign a payload array into a compact, tamper-proof, self-expiring token.
 * Format:  base64url(json_payload) . "." . base64url(hmac_sha256)
 * The payload is NOT encrypted (it holds the visitor's own answers + their own
 * address — nothing secret to them), only signed: a visitor cannot alter it and
 * an attacker cannot forge one without the server secret. This is what makes the
 * whole scheme storage-free — the signed token IS the state, so no session store
 * and no database are needed on Hostpoint.
 */
function vd_token_sign(array $payload, $secret) {
    $payload['iat'] = time();
    $payload['exp'] = time() + VD_TOKEN_TTL;
    $body = vd_b64url_encode(json_encode($payload, JSON_UNESCAPED_UNICODE));
    $sig  = vd_b64url_encode(hash_hmac('sha256', $body, $secret, true));
    return $body . '.' . $sig;
}

/**
 * Verify + decode a token. Returns the payload array on success, or false if
 * the token is malformed, the signature does not match, or it has expired.
 * Uses hash_equals for a constant-time signature comparison.
 */
function vd_token_verify($token, $secret) {
    if (!is_string($token) || strpos($token, '.') === false) return false;
    list($body, $sig) = explode('.', $token, 2);
    $expected = vd_b64url_encode(hash_hmac('sha256', $body, $secret, true));
    if (!hash_equals($expected, $sig)) return false;
    $json = vd_b64url_decode($body);
    if ($json === false) return false;
    $payload = json_decode($json, true);
    if (!is_array($payload)) return false;
    if (!isset($payload['exp']) || time() > (int)$payload['exp']) return false;
    return $payload;
}

/** Absolute base URL (scheme + host) of the current request. */
function vd_base_url() {
    $https  = (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off')
              || (($_SERVER['SERVER_PORT'] ?? '') == 443);
    $scheme = $https ? 'https' : 'http';
    $host   = $_SERVER['HTTP_HOST'] ?? 'vortexdeep.ch';
    return $scheme . '://' . $host;
}

// ── Server-side scoring (identical logic to the previous send-check.php) ──────

/**
 * Internal lead-quality bucket — used only in the team's own email, never
 * returned to any browser.
 */
function vd_calc_bucket($role, $category, $time, $process, $goal) {
    if ($role !== 'business') return 'other';
    $hasRealTimeCost = in_array($time, ['high', 'mid', 'unsure'], true);
    $hasMultiPain    = $category === 'several';
    $wantsOutcome    = in_array($goal, ['solve', 'clarity'], true);
    $processGap      = $process !== 'full';
    if (($hasRealTimeCost || $hasMultiPain) && $processGap && $wantsOutcome) return 'lead';
    return 'warm';
}

/**
 * Visitor-facing profile — FireFight / Refine / Build / Optimize, from
 * time x process. time=unsure is treated as the urgent row (same as high).
 */
function vd_calc_profile_key($time, $process) {
    $isUrgent    = in_array($time, ['high', 'unsure'], true);
    $fullProcess = $process === 'full';
    if ($isUrgent) {
        return $fullProcess ? 'refine' : 'fireFight';
    }
    return $fullProcess ? 'optimize' : 'build';
}

// ── Human-readable label maps for the internal email ─────────────────────────
function vd_labels() {
    return [
        'category' => [
            'comms'     => 'Inquiries, messages & customer support',
            'sales'     => 'Sales pipeline & lead follow-up',
            'docs'      => 'Documents, invoices, contracts & forms',
            'ops'       => 'Internal approvals, scheduling & onboarding',
            'reporting' => 'Reporting & data aggregation',
            'content'   => 'Content, marketing & e-commerce flows',
            'several'   => 'Multiple areas simultaneously',
        ],
        'time' => [
            'high'   => 'More than 5 hours per week',
            'mid'    => '1-5 hours per week',
            'low'    => 'Less than 1 hour per week',
            'unsure' => 'Spread across the team (hard to quantify)',
        ],
        'process' => [
            'none'    => 'No defined process — whoever has time handles it',
            'partial' => 'Some rules exist but inconsistently followed',
            'full'    => 'Defined process — needs to run faster',
        ],
        'goal' => [
            'solve'   => 'Practical workflow to reduce the manual work',
            'clarity' => 'Better visibility for decision-making',
            'explore' => 'Understanding what is possible before committing',
            'compare' => 'Seeing how others have approached this',
        ],
    ];
}

function vd_label($map, $key) {
    return isset($map[$key]) ? $map[$key] : $key;
}

function vd_build_matrix_diagram($profileKey) {
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

/**
 * Build the internal notification email (subject + body) for the team.
 * $d is the decoded token payload (raw answers + contact fields + flags).
 * $profile is the matched entry from $PROFILES (name/tagline/description).
 *
 * This is the ONE place all four quadrants and both bucket meanings are ever
 * written out together — safe because this email never reaches a browser.
 */
function vd_build_internal_email($d, $profile, $bucket, $profileKey) {
    $L = vd_labels();

    $subjects = [
        'lead'  => '★ Strong fit — VortexDeep Fit Check',
        'warm'  => '◎ Warm lead — VortexDeep Fit Check',
        'other' => '○ Interest noted — VortexDeep Fit Check',
    ];
    $subject = $subjects[$bucket] ?? 'New submission — VortexDeep Fit Check';

    $suspicious = !empty($d['s']);
    $reasons    = isset($d['sr']) ? (string)$d['sr'] : '';
    if ($suspicious) {
        $subject = '⚠ ' . $subject; // flagged, not blocked
    }

    $bucket_glossary =
        'lead = strongest fit (real time cost, process gap, wants a practical outcome)  |  '
      . 'warm = business but a softer fit (e.g. process already fairly solid, or just exploring/comparing)  |  '
      . 'other = not a business decision-maker — these never reach this email; they see a short thank-you on the page instead';

    $body = "BUCKET:  $bucket\n"
          . "PROFILE: " . $profile['name'] . " [$profileKey]\n"
          . "Source: " . ($d['src'] ?? '') . "\n"
          . "Confirmed: yes (visitor clicked the emailed verification link — address is real & theirs)\n"
          . ($suspicious ? "FLAGGED: " . $reasons . " (not blocked — verify before replying)\n" : "")
          . "\n"

          . "--- What BUCKET means ---\n"
          . $bucket_glossary . "\n\n"

          . "--- Full matrix — where this submission lands ---\n"
          . "(rows: time cost, urgent = high or hard-to-say/spread-across-team; columns: whether a defined process exists)\n"
          . vd_build_matrix_diagram($profileKey) . "\n\n"

          . "--- What the client saw on screen ---\n"
          . "(exact text — no profile name/label was shown to them, just this)\n"
          . $profile['tagline'] . "\n"
          . $profile['description'] . "\n\n"

          . "--- Contact ---\n"
          . "Email:   " . ($d['e'] ?? '') . "\n"
          . "Name:    " . ($d['n'] ?? '') . "\n"
          . "Company: " . ($d['c'] ?? '') . "\n"
          . "Note:    " . ($d['o'] ?? '') . "\n\n"

          . "--- Fit Check answers ---\n"
          . "Role:      business\n"
          . "Category:  " . vd_label($L['category'], $d['cat'] ?? '') . "\n"
          . "Follow-up: " . ($d['fu'] ?? '') . "\n"
          . "Time:      " . vd_label($L['time'], $d['t'] ?? '') . "\n"
          . "Process:   " . vd_label($L['process'], $d['p'] ?? '') . "\n"
          . "Goal:      " . vd_label($L['goal'], $d['g'] ?? '') . "\n\n"

          . "--- AI READY ---\n"
          . "bucket:        $bucket\n"
          . "profile:       $profileKey\n"
          . "role:          business\n"
          . "category:      " . vd_label($L['category'], $d['cat'] ?? '') . "\n"
          . "followup:      " . ($d['fu'] ?? '') . "\n"
          . "time_per_week: " . vd_label($L['time'], $d['t'] ?? '') . "\n"
          . "process:       " . vd_label($L['process'], $d['p'] ?? '') . "\n"
          . "goal:          " . vd_label($L['goal'], $d['g'] ?? '') . "\n"
          . "name:          " . ($d['n'] ?? '') . "\n"
          . "company:       " . ($d['c'] ?? '') . "\n"
          . "note:          " . ($d['o'] ?? '') . "\n";

    return [$subject, $body];
}
