<?php

namespace App\Http\Controllers;

use App\Models\BloodGroup;
use Illuminate\Http\Request;

class BloodGroupController extends Controller
{
    public function index()
    {
        $bloodGroups = BloodGroup::all();
        
        return response()->json([
            'success' => true,
            'data' => $bloodGroups
        ]);
    }
}
