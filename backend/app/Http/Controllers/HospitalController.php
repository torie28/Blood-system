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

    public function update(Request $request, $id): JsonResponse
    {
        $hospital = Hospital::find($id);
        
        if (!$hospital) {
            return response()->json([
                'success' => false,
                'message' => 'Hospital not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:hospitals,email,'.$id,
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

            $hospital->update([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'address' => $request->address,
                'location_id' => $location->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Hospital updated successfully',
                'data' => $hospital->load('location')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update hospital: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        $hospital = Hospital::find($id);
        
        if (!$hospital) {
            return response()->json([
                'success' => false,
                'message' => 'Hospital not found'
            ], 404);
        }

        try {
            $hospital->delete();

            return response()->json([
                'success' => true,
                'message' => 'Hospital deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete hospital: ' . $e->getMessage()
            ], 500);
        }
    }
}
