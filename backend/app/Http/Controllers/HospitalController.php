<?php

namespace App\Http\Controllers;

use App\Models\Hospital;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class HospitalController extends Controller
{
    public function index(): JsonResponse
    {
        $hospitals = Hospital::with('location')->get();
        
        return response()->json([
            'success' => true,
            'data' => $hospitals
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:hospitals,email',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'location' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Find or create location
            $location = Location::firstOrCreate([
                'city' => $request->location,
                'region' => $request->location // Using location as region for now, can be modified
            ]);

            $hospital = Hospital::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'address' => $request->address,
                'location_id' => $location->id,
                'created_by' => 1 // Default user ID, can be updated to use authenticated user
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Hospital created successfully',
                'data' => $hospital->load('location')
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create hospital: ' . $e->getMessage()
            ], 500);
        }
    }
}
