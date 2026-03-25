<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Location;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $locations = [
            ['city' => 'Nairobi', 'region' => 'Nairobi County'],
            ['city' => 'Mombasa', 'region' => 'Mombasa County'],
            ['city' => 'Kisumu', 'region' => 'Kisumu County'],
            ['city' => 'Nakuru', 'region' => 'Nakuru County'],
            ['city' => 'Eldoret', 'region' => 'Uasin Gishu County'],
        ];
        
        foreach ($locations as $location) {
            Location::firstOrCreate($location);
        }
    }
}
