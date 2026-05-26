<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BloodBank;
use App\Models\Hospital;

class BloodBankSeeder extends Seeder
{
    public function run(): void
    {
        $bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

        // Sample inventory levels per hospital
        $inventoryData = [
            1 => ['O+' => 85, 'O-' => 35, 'A+' => 62, 'A-' => 22, 'B+' => 45, 'B-' => 8,  'AB+' => 28, 'AB-' => 5],
            2 => ['O+' => 42, 'O-' => 18, 'A+' => 30, 'A-' => 12, 'B+' => 25, 'B-' => 4,  'AB+' => 14, 'AB-' => 3],
            3 => ['O+' => 60, 'O-' => 20, 'A+' => 48, 'A-' => 15, 'B+' => 33, 'B-' => 6,  'AB+' => 19, 'AB-' => 2],
            4 => ['O+' => 28, 'O-' => 9,  'A+' => 21, 'A-' => 7,  'B+' => 15, 'B-' => 3,  'AB+' => 8,  'AB-' => 1],
            5 => ['O+' => 15, 'O-' => 5,  'A+' => 11, 'A-' => 4,  'B+' => 8,  'B-' => 2,  'AB+' => 4,  'AB-' => 0],
            6 => ['O+' => 50, 'O-' => 22, 'A+' => 38, 'A-' => 13, 'B+' => 27, 'B-' => 5,  'AB+' => 16, 'AB-' => 2],
            7 => ['O+' => 33, 'O-' => 11, 'A+' => 25, 'A-' => 9,  'B+' => 18, 'B-' => 3,  'AB+' => 10, 'AB-' => 1],
        ];

        $hospitals = Hospital::all();

        foreach ($hospitals as $hospital) {
            $data = $inventoryData[$hospital->id] ?? [];

            foreach ($bloodTypes as $type) {
                BloodBank::updateOrCreate(
                    ['hospital_id' => $hospital->id, 'blood_group' => $type],
                    ['units_available' => $data[$type] ?? 0]
                );
            }
        }
    }
}
