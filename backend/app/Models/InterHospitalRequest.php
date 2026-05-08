<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InterHospitalRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'from_hospital_id',
        'to_hospital_id',
        'location_id',
        'blood_group',
        'units_requested',
        'status',
        'request_date',
    ];

    protected $casts = [
        'request_date' => 'date',
    ];

    public function fromHospital()
    {
        return $this->belongsTo(Hospital::class, 'from_hospital_id');
    }

    public function toHospital()
    {
        return $this->belongsTo(Hospital::class, 'to_hospital_id');
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }
}
