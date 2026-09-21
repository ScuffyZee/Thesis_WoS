FROM php:8.3-fpm-alpine

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
    icu-dev

# Install PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_sqlite \
    mbstring \
    zip \
    gd \
    intl \
    opcache

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy composer files first (for layer caching)
COPY composer.json composer.lock ./

# Install PHP dependencies (no dev)
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

# Copy package files
COPY package.json package-lock.json ./

# Install Node dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Run composer scripts now that full app is present
RUN composer run-script post-autoload-dump || true

# Build frontend assets (VERCEL=0 ensures wayfinder runs if php is available)
RUN php artisan wayfinder:generate --with-form 2>/dev/null || true
RUN npm run build

# Set permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage \
    && chmod -R 755 /var/www/bootstrap/cache

# Copy nginx config
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy startup script
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 10000

CMD ["/start.sh"]
