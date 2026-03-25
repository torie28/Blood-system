<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RecipientSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'recipient@bloodsystem.com'],
            [
                'name' => 'John Recipient',
                'email' => 'recipient@bloodsystem.com',
                'password' => Hash::make('recipient123'),
                'role' => 'recipient',
                'location' => 'City Hospital',
                'phone_number' => '+0987654321'
            ]
        );
    }
}
