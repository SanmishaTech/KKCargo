<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'company_name',
        'street_address',
        'area',
        'city',
        'state',
        'pincode',
        'country',
        'type_of_company',
        'other_type_of_company',
        'contact_person',
        'contact_person_designation',
        'contact_email',
        'contact_mobile',
        'alternate_contact_person',
        'alternate_contact_person_designation',
        'alternate_contact_email',
        'alternate_contact_mobile',
        'status',
        'grade',
        'last_calling_date'
    ];

    public function followUps(): HasMany
    {
        return $this->hasMany(FollowUp::class);
    }

    public function latestFollowUp()
    {
        return $this->hasOne(FollowUp::class)->latestOfMany();
    }

    public function latestCall()
    {
        return $this->hasOne(FollowUp::class)->where('follow_up_type', 'call')->latestOfMany();
    }
}
