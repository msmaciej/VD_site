<?php
/**
 * confirm.php
 * VortexDeep Fit Check — STAGE 2 of 2: verify the link, reveal the result,
 * notify the team.
 *
 * Reached only via the one-time link emailed by send-check.php. Two steps:
 *
 *   GET  ?t=<token>   Validates the token and renders a single "See my result"
 *                     button. Sends NO email and reveals NOTHING. This exists so
 *                     that corporate mail link-scanners / prefetchers (which
 *                     issue GETs on links inside email) cannot auto-confirm on
 *                     the human's behalf or trigger the team notification.
 *
 *   POST t=<token>    The human clicked the button. Re-verifies the token,
 *                     scores the answers server-side, reveals ONLY the matched
 *                     profile's tagline + description, and emails the team the
 *                     full internal breakdown (flagged if the original
 *                     submission tripped a soft bot signal).
 *
 * No session, no database — the signed token carries everything (see
 * fitcheck-lib.php). Clicking the button twice within the 30-minute window can
 * send the team two notifications; that is the only cost of being storage-free
 * and is harmless.
 *
 * LEAK RULE: this page outputs ONLY the matched tagline + description (plus the
 * shared disclaimer + CTA). The profile NAME, the bucket, the other profiles,
 * and the matrix never reach the browser.
 */

require_once __DIR__ . '/fitcheck-lib.php';

$teamRecipient = "info@vortexdeep.ch";

// ── Load config-sourced copy + theme (generated from config.json at build) ───
$genFile = __DIR__ . '/fitcheck-profiles.gen.php';
$genOk = is_file($genFile);
if ($genOk) {
    require $genFile; // $PROFILES, $RESULT_SHARED, $CONFIRM_UI, $FITCHECK_THEME
}

// Fallback theme so the page still renders if the generated include is somehow
// absent (it never should be from a clean build).
$THEME = isset($FITCHECK_THEME) && is_array($FITCHECK_THEME) ? $FITCHECK_THEME : [
    'bg' => '#0c0f14', 'text' => '#e0e2e8', 'muted' => '#6e7a8a',
    'accent' => '#8aa4c0', 'font' => "'IBM Plex Mono', monospace",
];

// Resolve language early (from token if we can read it, else default en) so
// even the error page is in the right language where possible.
$rawToken = $_SERVER['REQUEST_METHOD'] === 'POST'
    ? ($_POST['t'] ?? '')
    : ($_GET['t'] ?? '');

$secret  = $GLOBALS['VD_HMAC_SECRET'] ?? '';
$payload = ($secret !== '') ? vd_token_verify($rawToken, $secret) : false;

$lang = 'en';
if (is_array($payload) && ($payload['l'] ?? '') === 'de') $lang = 'de';

$ui = (isset($CONFIRM_UI[$lang]) && is_array($CONFIRM_UI[$lang])) ? $CONFIRM_UI[$lang] : [];
$rs = (isset($RESULT_SHARED[$lang]) && is_array($RESULT_SHARED[$lang])) ? $RESULT_SHARED[$lang] : [];

$contactEmail = 'info@vortexdeep.ch';
$backUrl = $lang === 'de' ? '/de/check' : '/check';

/** Small helper: safe HTML output. */
function e($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

// ── Page shell ───────────────────────────────────────────────────────────────
function render_page($lang, $THEME, $inner) {
    $font = $THEME['font'];
    header('Content-Type: text/html; charset=UTF-8');
    echo '<!DOCTYPE html><html lang="' . e($lang) . '"><head>'
       . '<meta charset="UTF-8">'
       . '<meta name="viewport" content="width=device-width, initial-scale=1">'
       . '<meta name="robots" content="noindex, nofollow">'
       . '<title>VortexDeep — Fit Check</title>'
       . '<link rel="preconnect" href="https://fonts.googleapis.com">'
       . '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
       . '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@100;300;400;500;600;700&display=swap" rel="stylesheet">'
       . '<style>'
       . ':root{--zen-bg:' . e($THEME['bg']) . ';--zen-text:' . e($THEME['text'])
       . ';--zen-muted:' . e($THEME['muted']) . ';--zen-accent:' . e($THEME['accent']) . ';}'
       . '*{box-sizing:border-box;}'
       . 'html,body{margin:0;padding:0;}'
       . 'body{background:var(--zen-bg);color:var(--zen-text);font-family:' . $font . ';'
       . 'min-height:100vh;min-height:100svh;display:flex;align-items:center;justify-content:center;padding:32px 24px;}'
       . '.wrap{max-width:36rem;width:100%;margin:0 auto;text-align:center;}'
       . '.tag{font-size:10px;text-transform:uppercase;letter-spacing:0.4em;opacity:0.4;margin:0 0 2rem;}'
       . '.rh{font-size:clamp(20px,4vw,28px);font-weight:300;line-height:1.4;margin:0 0 1.25rem;}'
       . '.rb{font-size:15px;font-weight:300;line-height:1.7;opacity:0.9;margin:0 auto 1.25rem;max-width:30rem;}'
       . '.disc{font-size:15px;font-weight:300;line-height:1.7;opacity:0.5;margin:0 auto 2rem;max-width:30rem;}'
       . '.btn{background:none;border:none;border-bottom:1px solid var(--zen-text);color:var(--zen-text);'
       . 'font-family:inherit;font-size:10px;text-transform:uppercase;letter-spacing:0.4em;padding:0 0 8px;'
       . 'cursor:pointer;transition:opacity .2s;}'
       . '.btn:hover{opacity:0.5;}'
       . 'a.link{color:var(--zen-accent);text-decoration:none;border-bottom:1px solid var(--zen-accent);'
       . 'font-size:10px;text-transform:uppercase;letter-spacing:0.3em;padding-bottom:4px;transition:opacity .2s;}'
       . 'a.link:hover{opacity:0.6;}'
       . '.spacer{height:2rem;}'
       . '</style></head><body><div class="wrap">'
       . $inner
       . '</div></body></html>';
}

// ── Invalid / expired token → friendly dead-end, offer a restart ─────────────
if (!is_array($payload)) {
    http_response_code($secret === '' ? 500 : 400);
    $heading = $ui['expiredHeading'] ?? ($lang === 'de' ? 'Dieser Link ist abgelaufen' : 'This link has expired');
    $body    = $ui['expiredBody'] ?? ($lang === 'de'
                 ? 'Fit-Check-Links gelten 30 Minuten. Starten Sie den Check neu, um einen frischen Link zu erhalten.'
                 : 'Fit Check links stay valid for 30 minutes. Start the check again to get a fresh one.');
    $back    = $ui['backLabel'] ?? ($lang === 'de' ? 'Zurück zum Fit Check' : 'Back to the Fit Check');
    $inner = '<p class="tag">VortexDeep</p>'
           . '<h1 class="rh">' . e($heading) . '</h1>'
           . '<p class="rb">' . e($body) . '</p>'
           . '<div class="spacer"></div>'
           . '<a class="link" href="' . e($backUrl) . '">' . e($back) . '</a>';
    render_page($lang, $THEME, $inner);
    exit;
}

// From here the token is valid and unexpired.
$profileKey = vd_calc_profile_key($payload['t'] ?? '', $payload['p'] ?? '');

// ── POST: the human clicked the button → reveal + notify the team ────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Validate the generated copy is present and complete for this match.
    $haveProfile = isset($PROFILES[$lang][$profileKey])
        && is_array($PROFILES[$lang][$profileKey])
        && !empty($PROFILES[$lang][$profileKey]['tagline'])
        && !empty($PROFILES[$lang][$profileKey]['description']);

    if (!$genOk || !$haveProfile) {
        http_response_code(500);
        $inner = '<p class="tag">VortexDeep</p><h1 class="rh">'
               . e($lang === 'de' ? 'Etwas ist schiefgelaufen.' : 'Something went wrong.')
               . '</h1><p class="rb">'
               . e($lang === 'de'
                    ? 'Bitte schreiben Sie uns direkt: '
                    : 'Please reach out to us directly: ')
               . '<a class="link" href="mailto:' . e($contactEmail) . '" style="text-transform:none;letter-spacing:normal;">' . e($contactEmail) . '</a>'
               . '</p>';
        error_log("confirm.php: profiles missing/incomplete for [$lang][$profileKey]");
        render_page($lang, $THEME, $inner);
        exit;
    }

    $profile = $PROFILES[$lang][$profileKey];

    // Notify the team — full internal breakdown, computed from the token.
    $bucket = vd_calc_bucket('business', $payload['cat'] ?? '', $payload['t'] ?? '', $payload['p'] ?? '', $payload['g'] ?? '');
    list($subject, $body) = vd_build_internal_email($payload, $profile, $bucket, $profileKey);
    $headers = "From: noreply@vortexdeep.ch\r\n"
             . "Reply-To: " . ($payload['e'] ?? $contactEmail) . "\r\n"
             . "Content-Type: text/plain; charset=UTF-8";
    @mail($teamRecipient, $subject, $body, $headers); // reveal even if team mail hiccups

    // Reveal — matched tagline + description only.
    $resultTag = $ui['resultTag'] ?? ($lang === 'de' ? 'Ihr Ergebnis' : 'Your result');
    $disc      = $rs['disclaimer'] ?? '';
    $ctaLabel  = $rs['ctaLabel'] ?? ($lang === 'de' ? 'Lassen Sie uns kurz darüber sprechen' : "Let's talk it through");

    $inner = '<p class="tag">' . e($resultTag) . '</p>'
           . '<h1 class="rh">' . e($profile['tagline']) . '</h1>'
           . '<p class="rb">' . e($profile['description']) . '</p>'
           . ($disc !== '' ? '<p class="disc">' . e($disc) . '</p>' : '')
           . '<a class="link" href="mailto:' . e($contactEmail) . '">' . e($ctaLabel) . '</a>';
    render_page($lang, $THEME, $inner);
    exit;
}

// ── GET: token valid → show the confirm button (no reveal, no mail yet) ───────
$heading = $ui['confirmHeading'] ?? ($lang === 'de' ? 'Noch eine Bestätigung' : 'One tap to confirm');
$bodyTxt = $ui['confirmBody'] ?? ($lang === 'de'
             ? 'Ein Klick bestätigt, dass die Adresse Ihnen gehört. Danach erscheint hier Ihr Ergebnis.'
             : 'One tap confirms the address is yours. Your result then appears right here.');
$btn     = $ui['confirmButton'] ?? ($lang === 'de' ? 'Mein Ergebnis sehen' : 'See my result');

$inner = '<p class="tag">VortexDeep</p>'
       . '<h1 class="rh">' . e($heading) . '</h1>'
       . '<p class="rb">' . e($bodyTxt) . '</p>'
       . '<div class="spacer"></div>'
       . '<form method="POST" action="/confirm.php">'
       . '<input type="hidden" name="t" value="' . e($rawToken) . '">'
       . '<button type="submit" class="btn">' . e($btn) . '</button>'
       . '</form>';
render_page($lang, $THEME, $inner);
exit;
