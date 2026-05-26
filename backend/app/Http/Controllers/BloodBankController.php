<?php

namespace App\Http\Controllers;

use App\Models\BloodBank;
use App\Models\Hospital;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BloodBankController extends Controller
{
    /**
     * Return blood inventory grouped by hospital.
     * Each hospital entry includes its blood-type breakdown.
     */
    public function index(): JsonResponse
    {
        $hospitals = Hospital::with(['location', 'bloodBanks'])->get();

        $bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

        $data = $hospitals->map(function ($hospital) use ($bloodTypes) {
            // Build a blood-type => units map, defaulting to 0 for missing entries
            $inventory = [];
            foreach ($bloodTypes as $type) {
                $inventory[$type] = 0;
            }
            foreach ($hospital->bloodBanks as $bank) {
                $inventory[$bank->blood_group] = $bank->units_available;
            }

            return [
                'id'        => $hospital->id,
                'name'      => $hospital->name,
                'location'  => $hospital->location ? $hospital->location->city : 'N/A',
                'inventory' => $inventory,
                'total'     => array_sum($inventory),
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    /**
     * Update (upsert) the blood inventory for a specific hospital.
     */
    public function update(Request $request, $hospitalId): JsonResponse
    {
        $hospital = Hospital::find($hospitalId);

        if (!$hospital) {
            return response()->json(['success' => false, 'message' => 'Hospital not found'], 404);
        }

        $validated = $request->validate([
            'blood_group'      => 'required|in:O+,O-,A+,A-,B+,B-,AB+,AB-',
            'units_available'  => 'required|integer|min:0',
        ]);

        BloodBank::updateOrCreate(
            ['hospital_id' => $hospitalId, 'blood_group' => $validated['blood_group']],
            ['units_available' => $validated['units_available']]
        );

        return response()->json(['success' => true, 'message' => 'Inventory updated']);
    }
}
