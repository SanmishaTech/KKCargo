<?php

namespace App\Models;

use App\Models\User;
use App\Models\Institute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Staff extends Model
{
    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'course_id' => 'array',
        'semester_id' => 'array',
        'subject_id' => 'array',
    ];
    
  

    public function user()
    {
        return $this->belongsTo(User::class);
    }

   

    

   

    

     
}