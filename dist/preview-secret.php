<?php
/**
 * preview-secret.php  —  admin preview key. SERVER ONLY.
 *
 * Gitignored: this must never reach the public repo.
 * It must sit in the Hostpoint web root next to preview.php and gate.php.
 *
 * Rotate any time with:  npm run preview:key -- --force
 * Rotating invalidates every pass already issued.
 */

$VD_PREVIEW_KEY = 'rVPpxgcbSmd71T2DRGDdGJVc6lro5Uep';

// Where the real site sits. Default is a folder inside the web root that
// Apache refuses to serve. If your FTP lets you write ONE LEVEL ABOVE the
// web root, that is stronger still — put the folder there and point to it:
//     $VD_LIVE_DIR = __DIR__ . '/../_vd-live';
$VD_LIVE_DIR = __DIR__ . '/_vd-live';
