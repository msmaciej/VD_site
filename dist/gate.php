<?php
/**
 * gate.php  —  VortexDeep admin preview gate.
 *
 * WHAT THIS DOES, IN ONE SENTENCE:
 * If your browser is carrying a valid preview pass, this serves the REAL site
 * out of a folder the public cannot reach; otherwise it serves the ordinary
 * "in preparation" page. Nobody without the pass ever receives a byte of the
 * real site.
 *
 * HOW IT IS REACHED:
 * .htaccess sends every request here ONLY when a cookie named vd_preview is
 * present. A cookie is easy to fake, so .htaccess is just routing — the real
 * check happens below, in PHP, against the key in preview-secret.php.
 *
 * FAIL-SAFE BY DESIGN:
 * The docroot contains the "in preparation" build and nothing else. The real
 * site lives in a separate folder (see $VD_LIVE_DIR). So if .htaccess is ever
 * lost during an upload, this file is simply never called, and every visitor —
 * including you — gets the notice. It fails towards "paused", never towards
 * "accidentally public".
 */

require_once __DIR__ . '/preview-lib.php';

$valid = vd_preview_pass_is_valid();

// Original path, e.g. "/de/check/". .htaccess rewrote the request to this file
// but REQUEST_URI still holds what the visitor actually typed.
$uri  = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$rel  = vd_safe_relative_path($uri);

// A valid pass reads from the hidden live build; anything else reads the
// public docroot, which is the notice. Note the invalid-pass branch is NOT an
// error page — a stale or forged cookie must be indistinguishable from having
// no cookie at all.
$root = $valid ? vd_live_dir() : __DIR__;
$file = vd_resolve_file($root, $rel);

if ($file === null) {
    // Fall back to that build's home page rather than a bare 404, so a mistyped
    // address inside the preview doesn't look like the site is broken.
    $file = vd_resolve_file($root, '');
    if ($file === null) {
        http_response_code(404);
        header('Content-Type: text/plain; charset=utf-8');
        echo "Not found";
        exit;
    }
    http_response_code(404);
}

vd_send_file($file, $valid);
