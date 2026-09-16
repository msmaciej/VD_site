#!/usr/bin/env bash
# Clean, complete build for Hostpoint. Run from the repo root.
set -e
echo "▶ Removing old dist/ (so no stale hashed assets linger)…"
rm -rf dist
echo "▶ Building…"
npm run build
echo
echo "✓ Build complete. Verify these are present before uploading:"
for f in .htaccess index.html de/index.html check/index.html gate.php \
         preview-secret.php fitcheck-secret.php fitcheck-profiles.gen.php; do
  [ -e "dist/$f" ] && echo "   ✓ dist/$f" || echo "   ✗ MISSING dist/$f"
done
echo
echo "Now upload the ENTIRE dist/ to Hostpoint — see DEPLOY_HOSTPOINT.txt."
echo "Remember: your FTP client must SHOW HIDDEN FILES or .htaccess won't upload."
