# Use official PHP 8.4 FPM on Debian Bookworm â€” matches local dev environment
FROM php:8.4-fpm-bookworm

# Install system packages
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends \
        nginx \
        curl \
        git \
        zip \
        unzip \
        sqlite3 \
        libsqlite3-dev \
        libonig-dev \
        libpng-dev \
        libzip-dev \
        libicu-dev \
        libfreetype6-dev \
        libjpeg62-turbo-dev \
        libwebp-dev \
        libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20 via NodeSource
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_sqlite \
        mbstring \
        zip \
        gd \
        intl \
        opcache \
        pcntl \
        bcmath

# Install Composer 2
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# â”€â”€ PHP dependencies â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
COPY composer.json composer.lock ./

RUN COMPOSER_MEMORY_LIMIT=-1 composer install \
        --no-dev \
        --optimize-autoloader \
        --no-scripts \
        --no-interaction \
        --prefer-dist \
    && echo "Composer install succeeded"

# â”€â”€ Node dependencies â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
COPY package.json package-lock.json ./
RUN npm ci && echo "npm ci succeeded"

# â”€â”€ Application source â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
COPY . .

# Bootstrap .env for build-time artisan commands
RUN cp -n .env.example .env || true
RUN sed -i 's|DB_CONNECTION=.*|DB_CONNECTION=sqlite|' .env
RUN sed -i 's|# DB_DATABASE=.*||' .env
RUN echo "DB_DATABASE=/var/www/database/database.sqlite" >> .env
RUN touch database/database.sqlite

# Post-autoload + key generation
RUN COMPOSER_MEMORY_LIMIT=-1 composer run-script post-autoload-dump --no-interaction 2>/dev/null || true
RUN php artisan key:generate --force --ansi 2>&1 | tee /tmp/keygen.log && cat /tmp/keygen.log

# Run migrations at build time — clean environment, no Render interference
RUN php artisan migrate --force --no-interaction && echo "Migrations OK" \
    && cp database/database.sqlite database/database.sqlite.bak

# Generate Wayfinder routes then build assets
RUN php artisan wayfinder:generate --with-form 2>/dev/null || true
RUN npm run build && echo "Vite build succeeded"

# Permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 775 /var/www/storage \
    && chmod -R 775 /var/www/bootstrap/cache

# Nginx config — write main nginx.conf and our server block from scratch
RUN mkdir -p /etc/nginx/conf.d \
    && printf 'worker_processes auto;\npid /tmp/nginx.pid;\nerror_log /dev/stderr warn;\nevents { worker_connections 1024; }\nhttp {\n    include /etc/nginx/mime.types;\n    default_type application/octet-stream;\n    sendfile on;\n    keepalive_timeout 65;\n    access_log /dev/stdout;\n    client_body_temp_path /tmp/client_body;\n    proxy_temp_path /tmp/proxy;\n    fastcgi_temp_path /tmp/fastcgi;\n    include /etc/nginx/conf.d/*.conf;\n}\n' > /etc/nginx/nginx.conf \
    && printf 'server {\n    listen 10000 default_server;\n    root /var/www/public;\n    index index.php;\n    location /build/ { try_files $uri =404; expires 1y; add_header Cache-Control "public, immutable"; }\n    location /storage/ { try_files $uri =404; }\n    location / { try_files $uri $uri/ /index.php?$query_string; }\n    location ~ \\.php$ { fastcgi_pass 127.0.0.1:9000; fastcgi_index index.php; fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; include fastcgi_params; fastcgi_read_timeout 300; }\n    location ~ /\\.ht { deny all; }\n}\n' > /etc/nginx/conf.d/app.conf \
    && nginx -t

# Write start.sh directly in the image to avoid Windows CRLF issues
RUN printf '#!/bin/sh\nset -e\n\ncd /var/www\n\n' > /start.sh \
    && printf 'echo "==> Writing .env..."\n' >> /start.sh \
    && printf 'APP_KEY_CLEAN=$(printf "%%s" "$APP_KEY" | tr -d "\\r\\n\\t")\n' >> /start.sh \
    && printf 'APP_URL_CLEAN=$(printf "%%s" "${APP_URL:-https://thesis-wos.onrender.com}" | tr -d "\\r\\n\\t")\n' >> /start.sh \
    && printf 'APP_NAME_CLEAN=$(printf "%%s" "${APP_NAME:-MISO WOS}" | tr -d "\\r\\n\\t")\n' >> /start.sh \
    && printf 'APP_ENV_CLEAN=$(printf "%%s" "${APP_ENV:-production}" | tr -d "\\r\\n\\t")\n' >> /start.sh \
    && printf '{ \n' >> /start.sh \
    && printf 'printf "APP_NAME=\\"%%s\\"\\n" "$APP_NAME_CLEAN"\n' >> /start.sh \
    && printf 'printf "APP_ENV=%%s\\n" "$APP_ENV_CLEAN"\n' >> /start.sh \
    && printf 'printf "APP_KEY=%%s\\n" "$APP_KEY_CLEAN"\n' >> /start.sh \
    && printf 'printf "APP_DEBUG=false\\n"\n' >> /start.sh \
    && printf 'printf "APP_URL=%%s\\n" "$APP_URL_CLEAN"\n' >> /start.sh \
    && printf 'printf "LOG_CHANNEL=stderr\\n"\n' >> /start.sh \
    && printf 'printf "LOG_LEVEL=error\\n"\n' >> /start.sh \
    && printf 'printf "DB_CONNECTION=sqlite\\n"\n' >> /start.sh \
    && printf 'printf "DB_DATABASE=/var/www/database/database.sqlite\\n"\n' >> /start.sh \
    && printf 'printf "SESSION_DRIVER=cookie\\n"\n' >> /start.sh \
    && printf 'printf "CACHE_STORE=array\\n"\n' >> /start.sh \
    && printf 'printf "QUEUE_CONNECTION=sync\\n"\n' >> /start.sh \
    && printf 'printf "FILESYSTEM_DISK=local\\n"\n' >> /start.sh \
    && printf '} > .env\n' >> /start.sh \
    && printf 'echo "==> Setting up database..."\n' >> /start.sh \
    && printf 'mkdir -p /var/www/database\n' >> /start.sh \
    && printf 'cp /var/www/database/database.sqlite.bak /var/www/database/database.sqlite 2>/dev/null || touch /var/www/database/database.sqlite\n' >> /start.sh \
    && printf 'chown www-data:www-data /var/www/database/database.sqlite\n' >> /start.sh \
    && printf 'echo "==> Clearing cache..."\n' >> /start.sh \
    && printf 'rm -f /var/www/bootstrap/cache/config.php\n' >> /start.sh \
    && printf 'rm -f /var/www/bootstrap/cache/routes*.php\n' >> /start.sh \
    && printf 'rm -f /var/www/bootstrap/cache/services.php\n' >> /start.sh \
    && printf 'rm -f /var/www/bootstrap/cache/packages.php\n' >> /start.sh \
    && printf 'echo "==> .env contents:"\n' >> /start.sh \
    && printf 'cat -A .env\n' >> /start.sh \
    && printf 'echo "==> Storage link..."\n' >> /start.sh \
    && printf 'php artisan storage:link 2>/dev/null || true\n' >> /start.sh \
    && printf 'echo "==> Seeding users if empty..."\n' >> /start.sh \
    && printf 'USER_COUNT=$(sqlite3 /var/www/database/database.sqlite "SELECT COUNT(*) FROM users;" 2>/dev/null || echo 0)\n' >> /start.sh \
    && printf 'echo "User count: $USER_COUNT"\n' >> /start.sh \
    && printf 'if [ "$USER_COUNT" = "0" ]; then\n' >> /start.sh \
    && printf '  echo "==> Seeding initial users..."\n' >> /start.sh \
    && printf '  unset REQUEST_URI; php artisan db:seed --class=UserSeeder --force 2>&1 || true\n' >> /start.sh \
    && printf 'fi\n' >> /start.sh \
    && printf 'chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache\n' >> /start.sh \
    && printf 'chmod -R 775 /var/www/storage /var/www/bootstrap/cache\n' >> /start.sh \
    && printf 'echo "==> Starting PHP-FPM..."\n' >> /start.sh \
    && printf 'mkdir -p /run/php\n' >> /start.sh \
    && printf 'php-fpm -D\n' >> /start.sh \
    && printf 'sleep 2\n' >> /start.sh \
    && printf 'echo "==> Starting Nginx..."\n' >> /start.sh \
    && printf 'exec nginx -g "daemon off;"\n' >> /start.sh \
    && chmod +x /start.sh

EXPOSE 10000

CMD ["/start.sh"]
