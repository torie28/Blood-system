<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BloodRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'hospital_id',
        'blood_group',
        'units_needed',
        'urgency_level_id',
        'status',
        'request_date',
        'location_id',
        'created_by'
    ];

    protected $casts = [
        'request_date' => 'date',
    ];

    /**
     * Get the hospital that made the request.
     */
    public function hospital(): BelongsTo
    {
        return $this->belongsTo(Hospital::class);
    }

    /**
     * Get the urgency level for the request.
     */
    public function urgencyLevel(): BelongsTo
    {
        return $this->belongsTo(UrgencyLevel::class);
    }

    /**
     * Get the location for the request.
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Get the donations for this blood request.
     */
    public function donations(): HasMany
    {
        return $this->hasMany(Donation::class);
    }
}
