FROM php:8.4-fpm-bookworm

# System packages
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends \
        nginx \
        curl \
        git \
        zip \
        unzip \
        libonig-dev \
        libpng-dev \
        libzip-dev \
        libicu-dev \
        libfreetype6-dev \
        libjpeg62-turbo-dev \
        libwebp-dev \
        libxml2-dev \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions
RUN docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        mbstring \
        zip \
        gd \
        intl \
        opcache \
        pcntl \
        bcmath

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# PHP dependencies
COPY composer.json composer.lock ./

RUN COMPOSER_MEMORY_LIMIT=-1 composer install \
        --no-dev \
        --optimize-autoloader \
        --no-scripts \
        --no-interaction \
        --prefer-dist

# Node dependencies
COPY package.json package-lock.json ./

RUN npm ci

# Application
COPY . .

# Laravel autoload
RUN COMPOSER_MEMORY_LIMIT=-1 \
    composer run-script post-autoload-dump --no-interaction 2>/dev/null || true

# Generate Wayfinder routes
RUN php artisan wayfinder:generate --with-form 2>/dev/null || true

# Build frontend
RUN npm run build

# Permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 775 /var/www/storage \
    && chmod -R 775 /var/www/bootstrap/cache

# Nginx
RUN mkdir -p /etc/nginx/conf.d \
    && printf 'worker_processes auto;\npid /tmp/nginx.pid;\nerror_log /dev/stderr warn;\nevents { worker_connections 1024; }\nhttp {\n    include /etc/nginx/mime.types;\n    default_type application/octet-stream;\n    sendfile on;\n    keepalive_timeout 65;\n    access_log /dev/stdout;\n    client_body_temp_path /tmp/client_body;\n    proxy_temp_path /tmp/proxy;\n    fastcgi_temp_path /tmp/fastcgi;\n    include /etc/nginx/conf.d/*.conf;\n}\n' > /etc/nginx/nginx.conf \
    && printf 'server {\n    listen 10000 default_server;\n    root /var/www/public;\n    index index.php;\n    location /build/ { try_files $uri =404; expires 1y; add_header Cache-Control "public, immutable"; }\n    location /storage/ { try_files $uri =404; }\n    location / { try_files $uri $uri/ /index.php?$query_string; }\n    location ~ \\.php$ { fastcgi_pass 127.0.0.1:9000; fastcgi_index index.php; fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; include fastcgi_params; fastcgi_read_timeout 300; }\n    location ~ /\\.ht { deny all; }\n}\n' > /etc/nginx/conf.d/app.conf \
    && nginx -t

# Startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 10000

CMD ["/start.sh"]