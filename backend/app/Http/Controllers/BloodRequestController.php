<?php

namespace App\Http\Controllers;

use App\Models\BloodRequest;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BloodRequestController extends Controller
{
    /**
     * Get blood requests for the donor's location
     */
    public function getRequestsByLocation()
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Get donor's location
        $donorLocation = $user->location;
        
        \Log::info('Donor location: ' . $donorLocation);
        \Log::info('User ID: ' . $user->id);
        
        if (!$donorLocation) {
            return response()->json(['message' => 'Donor location not set'], 400);
        }

        // Find location ID that matches donor's location
        $location = Location::where('city', 'like', '%' . $donorLocation . '%')
            ->orWhere('region', 'like', '%' . $donorLocation . '%')
            ->first();

        \Log::info('Found location: ', [$location]);
        \Log::info('Location search query: %' . $donorLocation . '%');

        if (!$location) {
            // Log all available locations for debugging
            $allLocations = Location::all();
            \Log::info('All available locations:', $allLocations->toArray());
            return response()->json(['message' => 'No matching location found for: ' . $donorLocation], 404);
        }

        \Log::info('Location ID: ' . $location->id);

        // Get blood requests for this location that are pending or approved
        $bloodRequests = BloodRequest::where('location_id', $location->id)
            ->whereIn('status', ['pending', 'approved'])
            ->with(['hospital', 'urgencyLevel', 'location'])
            ->orderBy('request_date', 'desc')
            ->get();

        \Log::info('Blood requests found: ' . $bloodRequests->count());
        \Log::info('Blood request details:', $bloodRequests->toArray());

        return response()->json([
            'success' => true,
            'requests' => $bloodRequests
        ]);
    }

    /**
     * Get donor requests (blood donation campaigns)
     */
    public function getDonorRequests()
    {
        $donorRequests = BloodRequest::with(['hospital', 'urgencyLevel', 'location'])
            ->where('status', '!=', 'fulfilled')
            ->orderBy('request_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'requests' => $donorRequests
        ]);
    }

    /**
     * Create a new donor request (blood donation campaign)
     */
    public function createDonorRequest(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'hospital_id' => 'required|exists:hospitals,id',
            'blood_group' => 'required|in:A+,A-,B+,B-,AB+,AB-,O+,O-,All',
            'units_needed' => 'required|integer|min:1',
            'urgency_level_id' => 'required|exists:urgency_levels,id',
            'location_id' => 'required|exists:locations,id',
            'contact_person' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'deadline' => 'required|date|after:today'
        ]);

        $donorRequest = BloodRequest::create([
            ...$validated,
            'status' => 'active',
            'created_by' => Auth::id()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Donor request created successfully',
            'request' => $donorRequest->load(['hospital', 'urgencyLevel', 'location'])
        ]);
    }

    /**
     * Get all blood requests (admin use)
     */
    public function index()
    {
        $bloodRequests = BloodRequest::with(['hospital', 'urgencyLevel', 'location'])
            ->orderBy('request_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'requests' => $bloodRequests
        ]);
    }

    /**
     * Create a new blood request (admin use)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'hospital_id' => 'required|exists:hospitals,id',
            'blood_group' => 'required|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'units_needed' => 'required|integer|min:1',
            'urgency_level_id' => 'required|exists:urgency_levels,id',
            'location_id' => 'required|exists:locations,id',
            'request_date' => 'required|date|after_or_equal:today'
        ]);

        $bloodRequest = BloodRequest::create([
            ...$validated,
            'status' => 'pending',
            'created_by' => Auth::id()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Blood request created successfully',
            'request' => $bloodRequest->load(['hospital', 'urgencyLevel', 'location'])
        ]);
    }
}
