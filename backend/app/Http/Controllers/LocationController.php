<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Location;

class LocationController extends Controller
{
    public function index()
    {
        try {
            $locations = Location::all()->map(function ($location) {
                return [
                    'id' => $location->id,
                    'name' => $location->city, // Use city as the name for frontend compatibility
                    'city' => $location->city,
                    'region' => $location->region
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => $locations
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch locations: ' . $e->getMessage()
            ], 500);
        }
    }
}
