FROM php:8.3-cli-alpine

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    nodejs \
    npm \
    curl \
    zip \
    unzip \
    git \
    sqlite \
    sqlite-dev \
    oniguruma-dev \
    libpng-dev \
    libzip-dev \
    icu-dev \
    freetype-dev \
    libjpeg-turbo-dev

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_sqlite \
        mbstring \
        zip \
        gd \
        intl \
        opcache \
        pcntl

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy composer files and install PHP deps first (layer cache)
COPY composer.json composer.lock ./
RUN composer install \
        --no-dev \
        --optimize-autoloader \
        --no-scripts \
        --no-interaction \
        --prefer-dist

# Copy package files and install Node deps
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# Copy full application source
COPY . .

# Create .env from example if not present (Render injects real env vars at runtime)
RUN cp -n .env.example .env || true

# Run post-install composer scripts (package discovery etc.)
RUN composer run-script post-autoload-dump --no-interaction 2>/dev/null || true

# Generate a temporary app key for build-time artisan commands
RUN php artisan key:generate --force

# Generate Wayfinder types then build frontend
RUN php artisan wayfinder:generate --with-form 2>/dev/null || true
RUN npm run build

# Set permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage \
    && chmod -R 755 /var/www/bootstrap/cache

# Nginx + startup
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 10000

CMD ["/start.sh"]
