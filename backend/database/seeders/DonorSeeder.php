<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DonorSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'donor@bloodsystem.com'],
            [
                'name' => 'Jane Donor',
                'email' => 'donor@bloodsystem.com',
                'password' => Hash::make('donor123'),
                'role' => 'donor',
                'location' => 'Community Center',
                'phone_number' => '+1122334455'
            ]
        );
    }
}
