# Use official PHP 8.3 FPM on Debian Bookworm
FROM php:8.3-fpm-bookworm

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

# ── PHP dependencies ──────────────────────────────────────────────────────────
COPY composer.json composer.lock ./

RUN COMPOSER_MEMORY_LIMIT=-1 COMPOSER_IGNORE_PLATFORM_REQS=1 composer install \
        --no-dev \
        --optimize-autoloader \
        --no-scripts \
        --no-interaction \
        --prefer-dist \
    && echo "Composer install succeeded"

# ── Node dependencies ─────────────────────────────────────────────────────────
COPY package.json package-lock.json ./
RUN npm ci && echo "npm ci succeeded"

# ── Application source ────────────────────────────────────────────────────────
COPY . .

# Bootstrap .env for build-time artisan commands
RUN cp -n .env.example .env || true

# Post-autoload + key generation
RUN COMPOSER_MEMORY_LIMIT=-1 composer run-script post-autoload-dump --no-interaction 2>/dev/null || true
RUN php artisan key:generate --force

# Generate Wayfinder routes then build assets
RUN php artisan wayfinder:generate --with-form 2>/dev/null || true
RUN npm run build && echo "Vite build succeeded"

# Permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 775 /var/www/storage \
    && chmod -R 775 /var/www/bootstrap/cache

# Nginx site config
COPY docker/nginx.conf /etc/nginx/sites-available/thesis_wos
RUN ln -sf /etc/nginx/sites-available/thesis_wos /etc/nginx/sites-enabled/thesis_wos \
    && rm -f /etc/nginx/sites-enabled/default

COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 10000

CMD ["/start.sh"]
