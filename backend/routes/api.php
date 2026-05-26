<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InterHospitalRequestController;
use App\Http\Controllers\BloodRequestController;
use App\Http\Controllers\HospitalController;
use App\Http\Controllers\BloodGroupController;
use App\Http\Controllers\UrgencyLevelController;
use App\Http\Controllers\auth\LoginController;
use App\Http\Controllers\auth\RegistrationController;
use App\Http\Controllers\BloodBankController;
use App\Http\Controllers\DonorController;

Route::get('/test', function () {
    return ['message' => 'API is working'];
});

Route::get('/hospitals', [HospitalController::class, 'index']);
Route::post('/hospitals', [HospitalController::class, 'store']);
Route::put('/hospitals/{id}', [HospitalController::class, 'update']);
Route::delete('/hospitals/{id}', [HospitalController::class, 'destroy']);

Route::get('/blood-groups', [BloodGroupController::class, 'index']);
Route::get('/urgency-levels', [UrgencyLevelController::class, 'index']);

Route::get('/locations', function () {
    return response()->json(['success' => true, 'data' => []]);
});

// Auth routes
Route::post('/register', [RegistrationController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);

// Inter-hospital blood request routes
// NOTE: static segment routes (/pending) must come BEFORE parameterised ones (/{id})
Route::get('/inter-hospital-requests', [InterHospitalRequestController::class, 'index']);
Route::post('/inter-hospital-requests', [InterHospitalRequestController::class, 'store']);
Route::get('/inter-hospital-requests/pending', [InterHospitalRequestController::class, 'getPendingRequests']);
Route::get('/inter-hospital-requests/hospital/{hospitalId}', [InterHospitalRequestController::class, 'getHospitalRequests']);
Route::get('/inter-hospital-requests/outgoing/{hospitalId}', [InterHospitalRequestController::class, 'getOutgoingRequests']);
Route::get('/inter-hospital-requests/incoming/{hospitalId}', [InterHospitalRequestController::class, 'getIncomingRequests']);
Route::put('/inter-hospital-requests/{id}/status', [InterHospitalRequestController::class, 'updateStatus']);

// Donor request routes
// NOTE: static segment /approved must come BEFORE /{id}
Route::get('/donor-requests', [BloodRequestController::class, 'getDonorRequests']);
Route::post('/donor-requests', [BloodRequestController::class, 'storeFromHospital']);
Route::put('/donor-requests/{id}/status', [BloodRequestController::class, 'updateDonorRequestStatus']);

// Location-based donor requests (for authenticated donors)
Route::middleware('auth:sanctum')->get('/blood-requests/location', [BloodRequestController::class, 'getRequestsByLocation']);

Route::get('/blood-inventory', [BloodBankController::class, 'index']);
Route::put('/blood-inventory/{hospitalId}', [BloodBankController::class, 'update']);

// Donor statistics
Route::get('/donor-stats', [DonorController::class, 'stats']);
