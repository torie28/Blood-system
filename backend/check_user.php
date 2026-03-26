<?php

require_once __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

use App\Models\User;

$user = User::where('email', 'donor@bloodsystem.com')->first();

if ($user) {
    echo "User found:\n";
    echo "ID: " . $user->id . "\n";
    echo "Name: " . $user->name . "\n";
    echo "Email: " . $user->email . "\n";
    echo "Blood Group: " . ($user->blood_group ?? 'NULL') . "\n";
    echo "Blood Type: " . ($user->blood_type ?? 'NULL') . "\n";
    echo "Role: " . $user->role . "\n";
} else {
    echo "User not found\n";
}
