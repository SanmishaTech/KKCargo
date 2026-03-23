<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Get the last follow-up where follow_up_type is 'call'
        $lastCallFollowUp = $this->latestCall;

        return array_merge(parent::toArray($request), [
            'last_calling_date' => $this->last_calling_date ?? ($lastCallFollowUp ? $lastCallFollowUp->next_follow_up_date : null),
        ]);
    }
}
