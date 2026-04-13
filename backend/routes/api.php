<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\auth\RegistrationController;
use App\Http\Controllers\auth\LoginController;
use App\Http\Controllers\HospitalController;
use App\Http\Controllers\BloodGroupController;
use App\Http\Controllers\UrgencyLevelController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\BloodRequestController;

Route::post('/register', [RegistrationController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);

Route::get('/hospitals', [HospitalController::class, 'index']);
Route::post('/hospitals', [HospitalController::class, 'store']);
Route::put('/hospitals/{id}', [HospitalController::class, 'update']);
Route::delete('/hospitals/{id}', [HospitalController::class, 'destroy']);
Route::get('/blood-groups', [BloodGroupController::class, 'index']);
Route::get('/urgency-levels', [UrgencyLevelController::class, 'index']);

// Protected donation routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/donations/stats', [DonationController::class, 'getDonationStats']);
    Route::get('/donations/history', [DonationController::class, 'getDonationHistory']);
    Route::post('/donations/schedule', [DonationController::class, 'scheduleDonation']);
    Route::get('/user/profile', [LoginController::class, 'profile']);
    Route::put('/user/profile', [LoginController::class, 'updateProfile']);
    
    // Blood request routes
    Route::get('/blood-requests/location', [BloodRequestController::class, 'getRequestsByLocation']);
    Route::get('/blood-requests', [BloodRequestController::class, 'index']);
    Route::post('/blood-requests', [BloodRequestController::class, 'store']);
    
    // Donor request routes (these are blood donation campaigns/requests)
    Route::get('/donor-requests', [BloodRequestController::class, 'getDonorRequests']);
    Route::post('/donor-requests', [BloodRequestController::class, 'createDonorRequest']);
});
