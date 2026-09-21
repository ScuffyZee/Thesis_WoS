#!/bin/sh
set -e

cd /var/www

echo "==> Setting up database..."
mkdir -p database
touch database/database.sqlite

echo "==> Generating app key..."
php artisan key:generate --force 2>/dev/null || true

echo "==> Running migrations..."
php artisan migrate --force

echo "==> Creating storage link..."
php artisan storage:link 2>/dev/null || true

echo "==> Caching config/routes/views..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "==> Starting PHP-FPM..."
mkdir -p /run/php
php-fpm -D

sleep 2

echo "==> Starting Nginx..."
exec nginx -g "daemon off;"
