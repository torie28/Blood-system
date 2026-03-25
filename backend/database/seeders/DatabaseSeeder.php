<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\UrgencyLevelSeeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Check if user already exists
        if (!User::where('email', 'test@example.com')->exists()) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'role' => 'admin',
                'location' => 'Nairobi',
                'phone_number' => '+254-123456789',
            ]);
        }

        $this->call([
            LocationSeeder::class,
            BloodGroupSeeder::class,
            HospitalSeeder::class,
            UrgencyLevelSeeder::class,
        ]);
    }
}
