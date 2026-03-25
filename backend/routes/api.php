<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\auth\RegistrationController;
use App\Http\Controllers\HospitalController;
use App\Http\Controllers\BloodGroupController;

Route::post('/register', [RegistrationController::class, 'register']);

Route::get('/hospitals', [HospitalController::class, 'index']);
Route::get('/blood-groups', [BloodGroupController::class, 'index']);
