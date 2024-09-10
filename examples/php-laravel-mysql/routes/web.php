<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['hello' => 'world!'];
});

Route::get('/users', function () {
    return \App\Models\User::all();
});