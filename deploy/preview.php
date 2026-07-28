<?php
/**
 * preview.php  —  hand yourself a preview pass, or hand it back.
 *
 * USAGE (only you ever need these two addresses):
 *
 *   https://vortexdeep.ch/preview.php?k=YOUR-KEY   -> start previewing
 *   https://vortexdeep.ch/preview.php?logout=1     -> stop previewing
 *
 * YOUR-KEY is the string in preview-secret.php, which lives only on the server
 * and is never committed to the repo.
 *
 * The pass lasts 30 days, then quietly expires and you see the public notice
 * again — which is the safe direction to fail in.
 */

require_once __DIR__ . '/preview-lib.php';

$cfg     = vd_preview_config();
$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

function vd_cookie(string $value, int $expires, bool $secure): void
{
    // PHP 7.3+ array syntax; falls back for older interpreters.
    if (PHP_VERSION_ID >= 70300) {
        setcookie(VD_PREVIEW_COOKIE, $value, [
            'expires'  => $expires,
            'path'     => '/',
            'secure'   => $secure,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    } else {
        setcookie(VD_PREVIEW_COOKIE, $value, $expires, '/; SameSite=Lax', '', $secure, true);
    }
}

function vd_reply(string $title, string $body, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: text/html; charset=utf-8');
    header('X-Robots-Tag: noindex, nofollow', true);
    header('Cache-Control: no-store');
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8">'
       . '<meta name="viewport" content="width=device-width,initial-scale=1">'
       . '<meta name="robots" content="noindex,nofollow">'
       . '<title>' . htmlspecialchars($title, ENT_QUOTES, 'UTF-8') . '</title>'
       . '<style>body{font:15px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;'
       . 'background:#0d0f12;color:#e8e8e8;display:flex;min-height:100vh;margin:0;'
       . 'align-items:center;justify-content:center;padding:2rem}'
       . 'div{max-width:32rem}a{color:#8ab4f8}</style></head><body><div>'
       . $body . '</div></body></html>';
    exit;
}

// ── Log out ─────────────────────────────────────────────────────────────────
if (isset($_GET['logout'])) {
    vd_cookie('', time() - 3600, $isHttps);
    vd_reply(
        'Preview ended',
        '<p><strong>Preview ended.</strong></p>'
        . '<p>You are seeing the public site again — the same "in preparation" '
        . 'page every visitor sees.</p><p><a href="/">Go to the site</a></p>'
    );
}

// ── Log in ──────────────────────────────────────────────────────────────────
$given = (string) ($_GET['k'] ?? '');

if ($given === '' ) {
    // Don't advertise what this endpoint is for.
    vd_reply('Not found', '<p>Not found.</p>', 404);
}

if ($cfg['key'] === '') {
    vd_reply(
        'Preview unavailable',
        '<p><strong>Preview is not configured on this server.</strong></p>'
        . '<p><code>preview-secret.php</code> is missing from the web root. '
        . 'Upload it and try again.</p>',
        503
    );
}

// Constant-time compare, and a small delay so the key can't be brute-forced by
// timing or by hammering the endpoint.
usleep(random_int(150000, 400000));

if (!hash_equals($cfg['key'], $given)) {
    vd_reply('Not found', '<p>Not found.</p>', 404);
}

$expiry = time() + (30 * 24 * 60 * 60);   // 30 days
vd_cookie(vd_preview_make_pass($expiry), $expiry, $isHttps);

vd_reply(
    'Preview active',
    '<p><strong>Preview active.</strong></p>'
    . '<p>You can now browse the real site at every address, as it will look '
    . 'when you go live. Everyone else still sees the "in preparation" page.</p>'
    . '<p>Expires ' . date('j F Y', $expiry) . '.</p>'
    . '<p><a href="/">Open the site</a> &nbsp;·&nbsp; '
    . '<a href="/preview.php?logout=1">End preview</a></p>'
);
