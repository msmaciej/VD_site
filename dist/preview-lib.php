<?php
/**
 * preview-lib.php  —  shared helpers for the admin preview gate.
 *
 * Included by preview.php (issues the pass) and gate.php (checks it, serves
 * files). Never served over HTTP directly — .htaccess denies it.
 *
 * The pass is a signed token, not the key itself. The key never travels to the
 * browser and never sits in a cookie, so a stolen cookie is useless once it
 * expires and cannot be used to work out the key.
 */

if (!defined('VD_PREVIEW_COOKIE')) {
    define('VD_PREVIEW_COOKIE', 'vd_preview');
}

/** Load the deploy-only config (key + live folder location). */
function vd_preview_config(): array
{
    static $cfg = null;
    if ($cfg !== null) return $cfg;

    $cfg = ['key' => '', 'live_dir' => __DIR__ . '/_vd-live'];

    $file = __DIR__ . '/preview-secret.php';
    if (is_readable($file)) {
        // The file sets $VD_PREVIEW_KEY and (optionally) $VD_LIVE_DIR.
        require $file;
        if (isset($VD_PREVIEW_KEY)) $cfg['key'] = (string) $VD_PREVIEW_KEY;
        if (isset($VD_LIVE_DIR) && $VD_LIVE_DIR !== '') $cfg['live_dir'] = (string) $VD_LIVE_DIR;
    }
    return $cfg;
}

function vd_live_dir(): string
{
    $cfg = vd_preview_config();
    $dir = realpath($cfg['live_dir']);
    return $dir === false ? '' : $dir;
}

/**
 * Build a signed pass valid until $expiry (unix time).
 * Format: <expiry>.<hex signature>
 */
function vd_preview_make_pass(int $expiry): string
{
    $cfg = vd_preview_config();
    $sig = hash_hmac('sha256', (string) $expiry, $cfg['key']);
    return $expiry . '.' . $sig;
}

/** True only for a well-formed, unexpired, correctly signed pass. */
function vd_preview_pass_is_valid(): bool
{
    $cfg = vd_preview_config();
    if ($cfg['key'] === '') return false;                 // no key deployed -> no preview

    $raw = $_COOKIE[VD_PREVIEW_COOKIE] ?? '';
    if ($raw === '' || strpos($raw, '.') === false) return false;

    list($expiry, $sig) = explode('.', $raw, 2);
    if (!ctype_digit($expiry)) return false;
    if ((int) $expiry < time()) return false;             // expired

    $expected = hash_hmac('sha256', $expiry, $cfg['key']);
    return hash_equals($expected, $sig);                  // constant-time compare
}

/**
 * Turn a request path into a safe relative path.
 * Strips anything that could climb out of the served folder.
 */
function vd_safe_relative_path(?string $uri): string
{
    $path = urldecode((string) $uri);
    $path = str_replace('\\', '/', $path);
    $path = ltrim($path, '/');

    $out = [];
    foreach (explode('/', $path) as $seg) {
        if ($seg === '' || $seg === '.') continue;
        if ($seg === '..') { array_pop($out); continue; }
        if (strpos($seg, "\0") !== false) return '';
        $out[] = $seg;
    }
    return implode('/', $out);
}

/**
 * Resolve a relative path to a real file inside $root, or null.
 * Directory requests resolve to index.html, matching how Astro builds pages.
 */
function vd_resolve_file(string $root, string $rel): ?string
{
    $rootReal = realpath($root);
    if ($rootReal === false) return null;

    $base = $rel === '' ? $rootReal : $rootReal . '/' . $rel;

    $candidates = [];
    if (is_dir($base)) {
        $candidates[] = rtrim($base, '/') . '/index.html';
    } else {
        $candidates[] = $base;
        $candidates[] = $base . '/index.html';   // /check -> /check/index.html
        $candidates[] = $base . '.html';
    }

    foreach ($candidates as $c) {
        $real = realpath($c);
        if ($real === false || !is_file($real)) continue;

        // Containment check: never serve anything outside the intended root,
        // and never serve PHP source through this gate.
        if (strncmp($real, $rootReal . DIRECTORY_SEPARATOR, strlen($rootReal) + 1) !== 0
            && $real !== $rootReal) continue;
        if (preg_match('/\.(php|htaccess)$/i', $real)) continue;

        return $real;
    }
    return null;
}

/** Send a file with a sensible Content-Type and no-cache while previewing. */
function vd_send_file(string $file, bool $isPreview): void
{
    static $types = [
        'html' => 'text/html; charset=utf-8',
        'css'  => 'text/css; charset=utf-8',
        'js'   => 'text/javascript; charset=utf-8',
        'mjs'  => 'text/javascript; charset=utf-8',
        'json' => 'application/json; charset=utf-8',
        'svg'  => 'image/svg+xml',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif'  => 'image/gif',
        'webp' => 'image/webp',
        'avif' => 'image/avif',
        'ico'  => 'image/x-icon',
        'woff' => 'font/woff',
        'woff2'=> 'font/woff2',
        'ttf'  => 'font/ttf',
        'txt'  => 'text/plain; charset=utf-8',
        'xml'  => 'application/xml; charset=utf-8',
        'pdf'  => 'application/pdf',
        'mp4'  => 'video/mp4',
        'webm' => 'video/webm',
    ];

    $ext  = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $mime = $types[$ext] ?? 'application/octet-stream';

    header('Content-Type: ' . $mime);
    header('Content-Length: ' . filesize($file));
    header('X-Robots-Tag: noindex, nofollow', true);   // never index anything via the gate
    header('Cache-Control: no-store, must-revalidate');
    if ($isPreview) {
        header('X-VD-Preview: 1');                     // so you can confirm you're in preview
    }

    readfile($file);
    exit;
}
