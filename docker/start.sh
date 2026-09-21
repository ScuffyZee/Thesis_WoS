#!/bin/sh
set -e

cd /var/www

# Create SQLite database if it doesn't exist
mkdir -p database
touch database/database.sqlite

# Generate app key if not set
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

# Run migrations
php artisan migrate --force

# Create storage symlink
php artisan storage:link 2>/dev/null || true

# Cache config/routes for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start PHP-FPM in background
php-fpm -D

# Start Nginx in foreground
nginx -g "daemon off;"
