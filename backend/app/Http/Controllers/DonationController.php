<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DonationController extends Controller
{
    /**
     * Get total donations count for the authenticated donor
     */
    public function getDonationStats()
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $totalDonations = Donation::where('donor_id', $user->id)
            ->where('status', 'completed')
            ->count();

        // Get last donation date
        $lastDonation = Donation::where('donor_id', $user->id)
            ->where('status', 'completed')
            ->orderBy('donation_date', 'desc')
            ->first();

        $daysSinceLastDonation = null;
        if ($lastDonation && $lastDonation->donation_date) {
            $daysSinceLastDonation = now()->diffInDays($lastDonation->donation_date);
        }

        return response()->json([
            'total_donations' => $totalDonations,
            'days_since_last_donation' => $daysSinceLastDonation,
            'last_donation_date' => $lastDonation?->donation_date
        ]);
    }

    /**
     * Get donation history for the authenticated donor
     */
    public function getDonationHistory()
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $donations = Donation::where('donor_id', $user->id)
            ->with(['bloodRequest.hospital'])
            ->orderBy('donation_date', 'desc')
            ->get();

        return response()->json($donations);
    }

    /**
     * Schedule a donation for a blood request
     */
    public function scheduleDonation(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'blood_request_id' => 'required|exists:blood_requests,id',
            'donation_date' => 'required|date|after_or_equal:today',
            'status' => 'required|in:scheduled'
        ]);

        try {
            // Create donation record
            $donation = Donation::create([
                'donor_id' => $user->id,
                'blood_request_id' => $validated['blood_request_id'],
                'donation_date' => $validated['donation_date'],
                'status' => $validated['status'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Update blood request status if needed
            $bloodRequest = BloodRequest::find($validated['blood_request_id']);
            if ($bloodRequest) {
                // You might want to update the blood request status here
                // For now, we'll leave it as is
            }

            return response()->json([
                'success' => true,
                'message' => 'Donation scheduled successfully',
                'donation' => $donation->load(['bloodRequest.hospital'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to schedule donation: ' . $e->getMessage()
            ], 500);
        }
    }
}
