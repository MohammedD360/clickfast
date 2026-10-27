#!/bin/sh
set -e
printf 'window.API_URL = "%s";\n' "${API_URL:-http://localhost:3000}" > /usr/share/nginx/html/config.js
