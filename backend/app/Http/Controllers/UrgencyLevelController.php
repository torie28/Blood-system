<?php

namespace App\Http\Controllers;

use App\Models\UrgencyLevel;
use Illuminate\Http\Request;

class UrgencyLevelController extends Controller
{
    public function index()
    {
        try {
            $urgencyLevels = UrgencyLevel::orderBy('level')->get();
            
            return response()->json([
                'success' => true,
                'data' => $urgencyLevels
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch urgency levels',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
