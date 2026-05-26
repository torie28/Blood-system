<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DonorController extends Controller
{
    /**
     * Return aggregate donor statistics:
     *  - total donors
     *  - donor count grouped by location
     *  - donor count grouped by blood type (blood_group + blood_type, e.g. "A+")
     */
    public function stats(Request $request)
    {
        // Only consider users who registered as donors
        $base = User::where('role', 'donor');

        $total = (clone $base)->count();

        // Group by location
        $byLocationRaw = (clone $base)
            ->select('location', DB::raw('count(*) as total'))
            ->whereNotNull('location')
            ->where('location', '!=', '')
            ->groupBy('location')
            ->orderByDesc('total')
            ->get();

        $byLocation = [];
        foreach ($byLocationRaw as $row) {
            $byLocation[$row->location] = (int) $row->total;
        }

        // Group by blood_group + blood_type (e.g. "A+", "O-")
        $byBloodTypeRaw = (clone $base)
            ->select(
                DB::raw("CONCAT(blood_group, blood_type) as blood_label"),
                DB::raw('count(*) as total')
            )
            ->whereNotNull('blood_group')
            ->whereNotNull('blood_type')
            ->where('blood_group', '!=', '')
            ->where('blood_type', '!=', '')
            ->groupBy('blood_label')
            ->orderByDesc('total')
            ->get();

        $byBloodType = [];
        foreach ($byBloodTypeRaw as $row) {
            $byBloodType[$row->blood_label] = (int) $row->total;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'total'       => $total,
                'byLocation'  => $byLocation,
                'byBloodType' => $byBloodType,
            ],
        ]);
    }
}
