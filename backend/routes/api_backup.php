<?php

use Illuminate\Support\Facades\Route;

Route::get('/test', function() {
    return ['message' => 'API is working'];
});
