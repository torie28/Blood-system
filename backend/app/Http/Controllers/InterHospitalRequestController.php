<?php

namespace App\Http\Controllers;

use App\Models\InterHospitalRequest;
use App\Models\Hospital;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

// Log for debugging
use Illuminate\Support\Facades\Log;

class InterHospitalRequestController extends Controller
{
    /**
     * Get all inter-hospital requests
     */
    public function index()
    {
        $requests = InterHospitalRequest::with(['fromHospital', 'toHospital', 'location'])
            ->orderBy('request_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $requests
        ]);
    }

    /**
     * Create a new inter-hospital request
     */
    public function store(Request $request)
    {
        Log::info('InterHospitalRequest store method called');
        Log::info('Request data:', $request->all());
        
        try {
            $validated = $request->validate([
                'from_hospital_id' => 'required|exists:hospitals,id',
                'to_hospital_id' => 'required|exists:hospitals,id|different:from_hospital_id',
                'location_id' => 'required|exists:locations,id',
                'blood_group' => 'required|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
                'units_requested' => 'required|integer|min:1|max:50',
                'request_date' => 'required|date|after_or_equal:today',
                'contact_person' => 'required|string|max:255',
                'phone_number' => 'required|string|max:20',
                'email' => 'required|email|max:255',
                'patient_name' => 'required|string|max:255',
                'patient_age' => 'required|integer|min:0|max:120',
                'patient_gender' => 'required|in:Male,Female,Other',
                'reason' => 'required|string|max:1000',
                'medical_history' => 'nullable|string|max:1000'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        try {
            $interHospitalRequest = InterHospitalRequest::create([
                'from_hospital_id' => $validated['from_hospital_id'],
                'to_hospital_id' => $validated['to_hospital_id'],
                'location_id' => $validated['location_id'],
                'blood_group' => $validated['blood_group'],
                'units_requested' => $validated['units_requested'],
                'status' => 'pending',
                'request_date' => $validated['request_date'],
            ]);

            // Store additional information in session or separate table if needed
            // For now, we'll include it in the response
            $requestData = [
                ...$interHospitalRequest->toArray(),
                'contact_person' => $validated['contact_person'],
                'phone_number' => $validated['phone_number'],
                'email' => $validated['email'],
                'patient_name' => $validated['patient_name'],
                'patient_age' => $validated['patient_age'],
                'patient_gender' => $validated['patient_gender'],
                'reason' => $validated['reason'],
                'medical_history' => $validated['medical_history'] ?? null,
            ];

            return response()->json([
                'success' => true,
                'message' => 'Inter-hospital blood request created successfully',
                'data' => $interHospitalRequest->load(['fromHospital', 'toHospital', 'location']),
                'request_details' => $requestData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create inter-hospital request: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update inter-hospital request status
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected,fulfilled'
        ]);

        $interHospitalRequest = InterHospitalRequest::findOrFail($id);
        $interHospitalRequest->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => 'Request status updated successfully',
            'data' => $interHospitalRequest->load(['fromHospital', 'toHospital', 'location'])
        ]);
    }

    /**
     * Get requests for a specific hospital
     */
    public function getHospitalRequests($hospitalId)
    {
        $requests = InterHospitalRequest::with(['fromHospital', 'toHospital', 'location'])
            ->where(function($query) use ($hospitalId) {
                $query->where('from_hospital_id', $hospitalId)
                      ->orWhere('to_hospital_id', $hospitalId);
            })
            ->orderBy('request_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $requests
        ]);
    }

    /**
     * Get pending requests
     */
    public function getPendingRequests()
    {
        $requests = InterHospitalRequest::with(['fromHospital', 'toHospital', 'location'])
            ->where('status', 'pending')
            ->orderBy('request_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $requests
        ]);
    }
}
