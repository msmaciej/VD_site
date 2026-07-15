<?php
/**
 * fitcheck-secret.php  —  HMAC signing key for Fit Check confirmation links.
 *
 * NOT IN VERSION CONTROL (see .gitignore). It is a secret. It IS part of the
 * deployment set — it must sit next to send-check.php / confirm.php in the
 * Hostpoint docroot, or those endpoints return a clean 500.
 *
 * Rotating it is safe: change the string, redeploy. The only effect is that any
 * confirmation links already in flight (max 30 min old) stop verifying. To
 * generate a fresh value, any long random hex string works, e.g.:
 *     php -r "echo bin2hex(random_bytes(48));"
 *
 * If this file is ever requested directly over HTTP it executes and prints
 * nothing; public/.htaccess also denies it outright.
 */
$VD_HMAC_SECRET = '4c0d910e2c62220afef1b78e3b5eaf56cec53203d679f2fdf2a3f55f6d6c523f959be9c26027f8e7bb801f2661e4cd5a';
