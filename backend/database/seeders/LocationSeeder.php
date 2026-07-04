<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Location;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $locations = [
            ['city' => 'Arusha', 'region' => 'Arusha '],
            ['city' => 'Arusha', 'region' => 'Arusha'],
            ['city' => 'Arusha', 'region' => 'Nganzerani'],
            ['city' => 'Arusha', 'region' => 'Arusha'],
            ['city' => 'Arusha', 'region' => 'Mererani'],
            ['city' => 'Arusha', 'region' => 'Arusha city '],
        ];
        
        foreach ($locations as $location) {
            Location::firstOrCreate($location);
        }
    }
}
