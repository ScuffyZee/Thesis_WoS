#!/bin/sh
set -e

cd /var/www

echo "==> Writing .env from environment variables..."
printf 'APP_NAME="%s"\n' "${APP_NAME:-MISO WOS}" > .env
printf 'APP_ENV="%s"\n' "${APP_ENV:-production}" >> .env
printf 'APP_KEY="%s"\n' "${APP_KEY}" >> .env
printf 'APP_DEBUG="%s"\n' "${APP_DEBUG:-false}" >> .env
printf 'APP_URL="%s"\n' "${APP_URL:-https://thesis-wos.onrender.com}" >> .env
printf 'LOG_CHANNEL=stderr\n' >> .env
printf 'LOG_LEVEL=error\n' >> .env
printf 'DB_CONNECTION=sqlite\n' >> .env
printf 'DB_DATABASE=/var/www/database/database.sqlite\n' >> .env
printf 'SESSION_DRIVER=cookie\n' >> .env
printf 'SESSION_LIFETIME=120\n' >> .env
printf 'CACHE_STORE=array\n' >> .env
printf 'QUEUE_CONNECTION=sync\n' >> .env
printf 'FILESYSTEM_DISK=local\n' >> .env
printf 'ASSET_URL="%s"\n' "${APP_URL:-https://thesis-wos.onrender.com}" >> .env

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
