<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\auth\RegistrationController;

Route::post('/register', [RegistrationController::class, 'register']);
