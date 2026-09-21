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
# Strip any Windows CR characters that may have survived git checkout
RUN sed -i 's/\r//' /start.sh && chmod +x /start.sh

EXPOSE 10000

CMD ["/start.sh"]
