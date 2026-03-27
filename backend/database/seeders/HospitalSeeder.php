<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Hospital;
use App\Models\Location;

class HospitalSeeder extends Seeder
{
    public function run(): void
    {
        $hospitals = [
            [
                'name' => 'City General Hospital',
                'email' => 'city.general@hospital.com',
                'phone' => '+254-20-123456',
                'address' => '123 Nairobi Street, Nairobi',
                'location_id' => 1,
            ],
            [
                'name' => 'St. Mary Medical Center',
                'email' => 'st.mary@hospital.com',
                'phone' => '+254-20-789012',
                'address' => '456 Mombasa Road, Mombasa',
                'location_id' => 2,
            ],
            [
                'name' => 'Regional Medical Center',
                'email' => 'regional.medical@hospital.com',
                'phone' => '+254-20-345678',
                'address' => '789 Kisumu Avenue, Kisumu',
                'location_id' => 3,
            ],
            [
                'name' => 'University Hospital',
                'email' => 'university@hospital.com',
                'phone' => '+254-20-901234',
                'address' => '321 Nakuru Highway, Nakuru',
                'location_id' => 4,
            ],
            [
                'name' => 'Community Health Center',
                'email' => 'community.health@hospital.com',
                'phone' => '+254-20-567890',
                'address' => '654 Eldoret Street, Eldoret',
                'location_id' => 5,
            ],
            [
                'name' => 'Arusha Regional Hospital',
                'email' => 'arusha.regional@hospital.com',
                'phone' => '+254-27-250123',
                'address' => '123 Arusha Road, Arusha',
                'location_id' => 6,
            ],
            [
                'name' => 'Mount Meru Hospital',
                'email' => 'mountmeru@hospital.com',
                'phone' => '+254-27-250456',
                'address' => '456 Mount Meru Street, Arusha',
                'location_id' => 6,
            ],
        ];
        
        foreach ($hospitals as $hospital) {
            Hospital::firstOrCreate(['email' => $hospital['email']], $hospital);
        }
    }
}
