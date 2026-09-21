#!/bin/sh
set -e

cd /var/www

# Ensure SQLite database file exists
mkdir -p database
touch database/database.sqlite

# Generate app key if APP_KEY is not set in environment
php artisan key:generate --force 2>/dev/null || true

# Run migrations
php artisan migrate --force

# Create storage symlink (ignore if already exists)
php artisan storage:link 2>/dev/null || true

# Cache for production performance
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create nginx temp dirs (needed when running as non-root)
mkdir -p /tmp/client_body /tmp/proxy /tmp/fastcgi /tmp/uwsgi /tmp/scgi

# Start PHP-FPM in background
php-fpm -D -y /usr/local/etc/php-fpm.conf

# Give PHP-FPM a moment to start
sleep 1

# Start Nginx in foreground (keeps container alive)
exec nginx -g "daemon off;"
