#!/bin/sh

php artisan migrate --force
php artisan db:seed --force
php-fpm &
nginx -g "daemon off;"