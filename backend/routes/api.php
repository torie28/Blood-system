<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\auth\RegistrationController;
use App\Http\Controllers\auth\LoginController;
use App\Http\Controllers\HospitalController;
use App\Http\Controllers\BloodGroupController;
use App\Http\Controllers\UrgencyLevelController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\BloodRequestController;
use App\Http\Controllers\LocationController;

Route::post('/register', [RegistrationController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);

Route::get('/hospitals', [HospitalController::class, 'index']);
Route::post('/hospitals', [HospitalController::class, 'store']);
Route::put('/hospitals/{id}', [HospitalController::class, 'update']);
Route::delete('/hospitals/{id}', [HospitalController::class, 'destroy']);
Route::get('/blood-groups', [BloodGroupController::class, 'index']);
Route::get('/urgency-levels', [UrgencyLevelController::class, 'index']);
Route::get('/locations', [LocationController::class, 'index']);

// Blood request routes (public access for admin dashboard)
Route::get('/blood-requests', [BloodRequestController::class, 'index']);
Route::get('/donor-requests', [BloodRequestController::class, 'getDonorRequests']);

// Protected donation routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/donations/stats', [DonationController::class, 'getDonationStats']);
    Route::get('/donations/history', [DonationController::class, 'getDonationHistory']);
    Route::post('/donations/schedule', [DonationController::class, 'scheduleDonation']);
    Route::get('/user/profile', [LoginController::class, 'profile']);
    Route::put('/user/profile', [LoginController::class, 'updateProfile']);
    Route::get('/blood-requests/location', [BloodRequestController::class, 'getRequestsByLocation']);
    
    // Protected blood request routes (for creating requests)
    Route::post('/blood-requests', [BloodRequestController::class, 'store']);
    Route::post('/donor-requests', [BloodRequestController::class, 'createDonorRequest']);
});
