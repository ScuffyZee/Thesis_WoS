#!/bin/sh
set -e

cd /var/www

echo "==> Writing .env from environment variables..."
# Build a fresh .env from Render's injected environment variables
cat > .env << EOF
APP_NAME="${APP_NAME:-MISO WOS}"
APP_ENV="${APP_ENV:-production}"
APP_KEY="${APP_KEY}"
APP_DEBUG="${APP_DEBUG:-false}"
APP_URL="${APP_URL:-https://thesis-wos.onrender.com}"

LOG_CHANNEL=stderr
LOG_LEVEL=error

DB_CONNECTION=sqlite
DB_DATABASE=/var/www/database/database.sqlite

SESSION_DRIVER=cookie
SESSION_LIFETIME=120

CACHE_STORE=array
QUEUE_CONNECTION=sync

FILESYSTEM_DISK=local

ASSET_URL="${APP_URL}"
FORCE_HTTPS=true
EOF

echo "==> Setting up database..."
mkdir -p /var/www/database
touch /var/www/database/database.sqlite

echo "==> Clearing cached config..."
php artisan config:clear 2>/dev/null || true
php artisan cache:clear 2>/dev/null || true

echo "==> Running migrations..."
php artisan migrate --force

echo "==> Creating storage link..."
php artisan storage:link 2>/dev/null || true

echo "==> Setting permissions..."
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
chmod -R 775 /var/www/storage /var/www/bootstrap/cache

echo "==> Starting PHP-FPM..."
mkdir -p /run/php
php-fpm -D

sleep 2

echo "==> Starting Nginx on port 10000..."
exec nginx -g "daemon off;"
