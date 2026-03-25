<?php

namespace App\Http\Controllers;

use App\Models\Hospital;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class HospitalController extends Controller
{
    public function index(): JsonResponse
    {
        $hospitals = Hospital::select('id', 'name')->orderBy('name')->get();
        
        return response()->json([
            'success' => true,
            'data' => $hospitals
        ]);
    }
}
