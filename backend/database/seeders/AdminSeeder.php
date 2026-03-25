<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@bloodsystem.com'],
            [
                'name' => 'System Administrator',
                'email' => 'admin@bloodsystem.com',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'location' => 'Main Office',
                'phone_number' => '+1234567890'
            ]
        );
    }
}
