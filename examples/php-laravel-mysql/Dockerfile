FROM php:8.2-fpm-alpine

RUN apk add --no-cache nginx postgresql-dev libpng-dev libzip-dev zip unzip
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql zip gd
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .
RUN composer install --no-interaction --no-dev --optimize-autoloader

RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

COPY docker/nginx.conf /etc/nginx/http.d/default.conf
RUN chmod +x /var/www/html/docker/start.sh

EXPOSE 80

ENTRYPOINT ["/var/www/html/docker/start.sh"]