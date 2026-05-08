<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InterHospitalRequestController;
use App\Http\Controllers\BloodRequestController;
use App\Http\Controllers\HospitalController;
use App\Http\Controllers\BloodGroupController;
use App\Http\Controllers\UrgencyLevelController;
use App\Http\Controllers\auth\LoginController;

Route::get('/test', function() {
    return ['message' => 'API is working'];
});

Route::get('/hospitals', [HospitalController::class, 'index']);
Route::post('/hospitals', [HospitalController::class, 'store']);
Route::put('/hospitals/{id}', [HospitalController::class, 'update']);
Route::delete('/hospitals/{id}', [HospitalController::class, 'destroy']);

Route::get('/blood-groups', [BloodGroupController::class, 'index']);
Route::get('/urgency-levels', [UrgencyLevelController::class, 'index']);

Route::get('/locations', function() {
    return response()->json(['success' => true, 'data' => []]);
});

Route::post('/register', function() {
    return response()->json(['success' => true, 'message' => 'Registration endpoint']);
});

Route::post('/login', [LoginController::class, 'login']);

Route::get('/inter-hospital-requests', [InterHospitalRequestController::class, 'index']);
Route::post('/inter-hospital-requests', [InterHospitalRequestController::class, 'store']);
Route::put('/inter-hospital-requests/{id}/status', [InterHospitalRequestController::class, 'updateStatus']);
Route::get('/inter-hospital-requests/hospital/{hospitalId}', [InterHospitalRequestController::class, 'getHospitalRequests']);
Route::get('/inter-hospital-requests/pending', [InterHospitalRequestController::class, 'getPendingRequests']);

Route::get('/donor-requests', [BloodRequestController::class, 'getDonorRequests']);
