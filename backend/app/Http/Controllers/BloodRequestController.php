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

        // Find ALL location IDs that match donor's location (city or region)
        $locations = Location::where('city', 'like', '%' . $donorLocation . '%')
            ->orWhere('region', 'like', '%' . $donorLocation . '%')
            ->get();

        \Log::info('Found locations: ', $locations->toArray());

        if ($locations->isEmpty()) {
            $allLocations = Location::all();
            \Log::info('All available locations:', $allLocations->toArray());
            return response()->json(['message' => 'No matching location found for: ' . $donorLocation], 404);
        }

        $locationIds = $locations->pluck('id')->toArray();

        // Get APPROVED blood requests for ALL matching locations
        $bloodRequests = BloodRequest::whereIn('location_id', $locationIds)
            ->where('status', 'approved')
            ->with(['hospital', 'urgencyLevel', 'location'])
            ->orderBy('request_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'requests' => $bloodRequests
        ]);
    }

    /**
     * Get donor requests with optional filtering.
     * Supports: ?hospital_id=1  ?status=approved  ?location=Nairobi
     */
    public function getDonorRequests(Request $request)
    {
        $query = BloodRequest::with(['hospital', 'urgencyLevel', 'location'])
            ->orderBy('request_date', 'desc');

        // Filter by hospital
        if ($request->hospital_id) {
            $query->where('hospital_id', $request->hospital_id);
        }

        // Filter by status
        if ($request->status) {
            $query->where('status', $request->status);
        } else {
            // Default: exclude fulfilled
            $query->where('status', '!=', 'fulfilled');
        }

        // Filter by location string (city/region name)
        if ($request->location) {
            $locations = Location::where('city', 'like', '%' . $request->location . '%')
                ->orWhere('region', 'like', '%' . $request->location . '%')
                ->get();
            if ($locations->isNotEmpty()) {
                $query->whereIn('location_id', $locations->pluck('id')->toArray());
            } else {
                // No matching location found — return empty
                return response()->json(['success' => true, 'requests' => []]);
            }
        }

        $donorRequests = $query->get();

        return response()->json([
            'success' => true,
            'requests' => $donorRequests
        ]);
    }

    /**
     * Hospital creates a donor-facing blood donation request.
     * Status starts as 'pending' — admin must approve before donors see it.
     */
    public function storeFromHospital(Request $request)
    {
        $validated = $request->validate([
            'hospital_id'      => 'required|exists:hospitals,id',
            'blood_group'      => 'required|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'units_needed'     => 'required|integer|min:1',
            'urgency_level_id' => 'required|exists:urgency_levels,id',
            'location_id'      => 'required|exists:locations,id',
            'contact_person'   => 'required|string|max:255',
            'contact_number'   => 'required|string|max:20',
            'deadline'         => 'required|date|after_or_equal:today',
            'title'            => 'nullable|string|max:255',
            'description'      => 'nullable|string',
        ]);

        $donorRequest = BloodRequest::create([
            'hospital_id'      => $validated['hospital_id'],
            'blood_group'      => $validated['blood_group'],
            'units_needed'     => $validated['units_needed'],
            'urgency_level_id' => $validated['urgency_level_id'],
            'location_id'      => $validated['location_id'],
            'contact_person'   => $validated['contact_person'],
            'contact_number'   => $validated['contact_number'],
            'deadline'         => $validated['deadline'],
            'title'            => $validated['title'] ?? "Blood Donation Request - {$validated['blood_group']}",
            'description'      => $validated['description'] ?? "Requesting {$validated['units_needed']} unit(s) of {$validated['blood_group']} blood.",
            'status'           => 'pending',
            'request_date'     => now()->format('Y-m-d'),
            'created_by'       => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Donor request submitted successfully. Awaiting admin approval.',
            'data'    => $donorRequest->load(['hospital', 'urgencyLevel', 'location']),
        ], 201);
    }

    /**
     * Admin approves or rejects a donor request.
     */
    public function updateDonorRequestStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected,fulfilled',
        ]);

        $bloodRequest = BloodRequest::with(['hospital', 'urgencyLevel', 'location'])->findOrFail($id);
        $bloodRequest->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => 'Request status updated to ' . $validated['status'],
            'data'    => $bloodRequest->fresh(['hospital', 'urgencyLevel', 'location']),
        ]);
    }

    /**
     * Create a new donor request (admin use)
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
