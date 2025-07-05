<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FollowUp extends Model
{
    protected $fillable = ['company_id', 'follow_up_date', 'notes'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
