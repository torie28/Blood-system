<?php

namespace Database\Seeders;

use App\Models\BloodRequest;
use App\Models\User;
use App\Models\Hospital;
use App\Models\Location;
use App\Models\UrgencyLevel;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BloodRequestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get admin users
        $admin = User::where('email', 'admin@bloodsystem.com')->first();
        $testAdmin = User::where('email', 'test@example.com')->first();
        
        // If no admin exists, create one
        if (!$admin) {
            $admin = User::firstOrCreate(
                ['email' => 'admin@bloodsystem.com'],
                [
                    'name' => 'System Administrator',
                    'password' => bcrypt('admin123'),
                    'role' => 'admin',
                    'location' => 'Nairobi',
                    'phone_number' => '+1234567890'
                ]
            );
        }

        // Get hospitals, locations, and urgency levels - check if they exist
        $hospitals = Hospital::all();
        $locations = Location::all();
        $urgencyLevels = UrgencyLevel::all();

        // Only proceed if we have the required data
        if ($hospitals->isEmpty() || $locations->isEmpty() || $urgencyLevels->isEmpty()) {
            $this->command->error('Missing required data. Please run LocationSeeder, HospitalSeeder, and UrgencyLevelSeeder first.');
            return;
        }

        // Sample blood requests data with dynamic IDs
        $bloodRequests = [];

        // Create requests for each hospital if they exist
        foreach ($hospitals as $index => $hospital) {
            // Skip if hospital doesn't have a valid location_id
            if (!$hospital->location_id) {
                continue;
            }
            
            $bloodTypes = ['O+', 'A-', 'B+', 'AB+', 'O-', 'A+', 'B-', 'AB-'];
            $bloodType = $bloodTypes[$index % count($bloodTypes)];
            
            $bloodRequests[] = [
                'hospital_id' => $hospital->id,
                'blood_group' => $bloodType,
                'units_needed' => rand(1, 8),
                'urgency_level_id' => $urgencyLevels->random()->id,
                'status' => 'pending',
                'request_date' => now()->addDays(rand(-2, 5)),
                'location_id' => $hospital->location_id, // Use the hospital's actual location_id
                'created_by' => $admin->id,
            ];
        }

        // Add a few more requests with different statuses
        if (count($bloodRequests) > 0) {
            $bloodRequests[0]['status'] = 'approved';
            $highUrgency = $urgencyLevels->where('level', 'high')->first();
            if ($highUrgency) {
                $bloodRequests[0]['urgency_level_id'] = $highUrgency->id;
            }
            
            if (isset($bloodRequests[1])) {
                $bloodRequests[1]['status'] = 'approved';
                $mediumUrgency = $urgencyLevels->where('level', 'medium')->first();
                if ($mediumUrgency) {
                    $bloodRequests[1]['urgency_level_id'] = $mediumUrgency->id;
                }
            }
        }

        // Insert blood requests
        foreach ($bloodRequests as $request) {
            BloodRequest::firstOrCreate([
                'hospital_id' => $request['hospital_id'],
                'blood_group' => $request['blood_group'],
                'request_date' => $request['request_date'],
            ], $request);
        }

        $this->command->info('Blood requests seeded successfully!');
    }
}
