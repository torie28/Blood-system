<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\UrgencyLevel;

class UrgencyLevelSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $urgencyLevels = [
            ['level' => 'low'],
            ['level' => 'medium'],
            ['level' => 'high'],
        ];

        foreach ($urgencyLevels as $level) {
            UrgencyLevel::firstOrCreate([
                'level' => $level['level']
            ]);
        }
    }
}
