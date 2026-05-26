<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Hospital;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\Hash;

/**
 * Seeds one staff account per hospital so each hospital can log in
 * and access the inter-hospital blood request dashboard.
 *
 * Credentials pattern:
 *   email    → first word of hospital name, lowercase + @hospital.com
 *              e.g. "City General Hospital" → city@hospital.com
 *   password → hospital123
 */
class HospitalUserSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $hospitals = Hospital::all();

        foreach ($hospitals as $hospital) {
            $firstWord = strtolower(explode(' ', $hospital->name)[0]);
            $email     = "{$firstWord}{$hospital->id}@hospital.com";

            User::updateOrCreate(
                ['email' => $email],
                [
                    'name'         => $hospital->name . ' Staff',
                    'email'        => $email,
                    'password'     => Hash::make('hospital123'),
                    'role'         => 'hospital',
                    'hospital_id'  => $hospital->id,
                    'location'     => $hospital->address ?? '',
                    'phone_number' => $hospital->phone ?? '',
                ]
            );
        }
    }
}
