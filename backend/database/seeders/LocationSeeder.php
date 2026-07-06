<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Location;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $locations = [
            ['city' => 'Arusha', 'region' => 'Arusha Central'],
            ['city' => 'Arusha', 'region' => 'Arusha East'],
            ['city' => 'Arusha', 'region' => 'Nganzerani'],
            ['city' => 'Arusha', 'region' => 'Arusha West'],
            ['city' => 'Arusha', 'region' => 'Mererani'],
            ['city' => 'Arusha', 'region' => 'Arusha City'],
        ];
        
        foreach ($locations as $location) {
            Location::firstOrCreate($location);
        }
    }
}
