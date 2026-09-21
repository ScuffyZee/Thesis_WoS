#!/bin/sh

set -e

cd /var/www

echo "==> Starting Laravel application..."

echo "==> Checking database configuration..."
echo "DB_CONNECTION=${DB_CONNECTION:-not set}"

if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL is not set."
    exit 1
fi

if [ "${DB_CONNECTION:-}" != "pgsql" ]; then
    echo "ERROR: DB_CONNECTION must be pgsql."
    exit 1
fi

echo "==> Clearing Laravel configuration cache..."
php artisan config:clear
php artisan cache:clear || true

echo "==> Running database migrations..."
php artisan migrate --force --no-interaction

echo "==> Creating storage link..."
php artisan storage:link 2>/dev/null || true

echo "==> Setting permissions..."
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
chmod -R 775 /var/www/storage /var/www/bootstrap/cache

echo "==> Starting PHP-FPM..."
mkdir -p /run/php
php-fpm -D

sleep 2

echo "==> Starting Nginx..."
exec nginx -g "daemon off;"