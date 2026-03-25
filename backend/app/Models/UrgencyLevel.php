<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UrgencyLevel extends Model
{
    use HasFactory;

    protected $fillable = [
        'level',
    ];

    protected $casts = [
        'level' => 'string',
    ];

    public $timestamps = true;
}
