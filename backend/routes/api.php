<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\auth\RegistrationController;
use App\Http\Controllers\auth\LoginController;
use App\Http\Controllers\HospitalController;
use App\Http\Controllers\BloodGroupController;
use App\Http\Controllers\UrgencyLevelController;

Route::post('/register', [RegistrationController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);

Route::get('/hospitals', [HospitalController::class, 'index']);
Route::post('/hospitals', [HospitalController::class, 'store']);
Route::put('/hospitals/{id}', [HospitalController::class, 'update']);
Route::delete('/hospitals/{id}', [HospitalController::class, 'destroy']);
Route::get('/blood-groups', [BloodGroupController::class, 'index']);
Route::get('/urgency-levels', [UrgencyLevelController::class, 'index']);
