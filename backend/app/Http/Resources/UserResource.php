<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'role'=> $this->resource->roles->first()->name,
            'staff_id' => $this->staff ? $this->staff->id : null,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at,
            'password' => $this->password,
            'active' => $this->active,
            'staff' => $this->staff,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,          
        ]; 
    }
}