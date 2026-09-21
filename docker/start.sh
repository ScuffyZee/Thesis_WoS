#!/bin/sh
set -e

cd /var/www

# Ensure SQLite database exists
mkdir -p database
touch database/database.sqlite

# Generate app key if not set
php artisan key:generate --force 2>/dev/null || true

# Run migrations
php artisan migrate --force

# Storage symlink
php artisan storage:link 2>/dev/null || true

# Cache for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start PHP-FPM
mkdir -p /run/php
php-fpm8.3 -D 2>/dev/null || php-fpm -D

sleep 1

# Disable default nginx site and use ours
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Start Nginx
exec nginx -g "daemon off;"
