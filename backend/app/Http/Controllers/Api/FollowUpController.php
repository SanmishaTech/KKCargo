<?php

namespace App\Http\Controllers\Api;

use App\Models\FollowUp;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\BaseController;
 use App\Http\Resources\FollowupResource;
use App\Services\ActivityLogger;

class FollowUpController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        // Build the base query.
        $query = FollowUp::query();

        // If there's a search term, apply additional filtering.
        if ($companyId = $request->query('company_id')) {
            $query->where('company_id', $companyId);
        }

        // Paginate the results.
        $followup = $query->oldest()->paginate(7);
    
        // Return the paginated response with staff resources.
        return $this->sendResponse(
            [
                "Followup" => FollowupResource::collection($followup),
                'Pagination' => [
                    'current_page' => $followup->currentPage(),
                    'last_page'    => $followup->lastPage(),
                    'per_page'     => $followup->perPage(),
                    'total'        => $followup->total(),
                ]
            ],
            "Followup retrieved successfully"
        );
    }


    public function store(Request $request): JsonResponse
    {
        // Create a new staff record and assign the institute_id from the logged-in admin
        $followup = new FollowUp();
         $followup->company_id = $request->input('company_id');
         $followup->follow_up_date = $request->input('follow_up_date');
         $followup->next_follow_up_date = $request->input('next_follow_up_date');
         $followup->follow_up_type = $request->input('follow_up_type');
         $followup->remarks = $request->input('remarks');
         $followup->save();

        // Log followup created
        $followup->load('company');
        ActivityLogger::log('followup.created', $followup, 'Follow-up created', [
            'company_id' => $followup->company_id,
            'company_name' => $followup->company ? $followup->company->company_name : null,
            'remarks' => $followup->remarks,
            'status' => $followup->company ? $followup->company->status : null
        ]);
        
        return $this->sendResponse([new FollowupResource($followup)], "Followup stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $followup = Followup::find($id);

        if(!$followup){
            return $this->sendError("Followup not found", ['error'=>'Followup not found']);
        }

  
        return $this->sendResponse([ "Followup" => new FollowupResource($followup) ], "Followup retrived successfully");
    }


    public function update(Request $request, string $id): JsonResponse
    {
 
        $followup = FollowUp::find($id);

        if(!$followup){
            return $this->sendError("Followup not found", ['error'=>'Followup not found']);
        }
       
                       
        $followup->company_id = $request->input('company_id');
        $followup->follow_up_date = $request->input('follow_up_date');
        $followup->next_follow_up_date = $request->input('next_follow_up_date');
        $followup->follow_up_type = $request->input('follow_up_type');
        $followup->remarks = $request->input('remarks');
           
        $followup->save();

        // Log followup updated
        $followup->load('company');
        ActivityLogger::log('followup.updated', $followup, 'Follow-up updated', [
            'company_id' => $followup->company_id,
            'company_name' => $followup->company ? $followup->company->company_name : null,
            'remarks' => $followup->remarks,
            'status' => $followup->company ? $followup->company->status : null
        ]);
       
        return $this->sendResponse([ new FollowupResource($followup)], "Followup updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
        $followup = FollowUp::with('company')->find($id);
        if(!$followup){
            return $this->sendError("Followup not found", ['error'=> 'Followup not found']);
        }
        
         // Store data before deletion
         $logData = [
             'followup_id' => (int)$id,
             'company_id' => $followup->company_id,
             'company_name' => $followup->company ? $followup->company->company_name : null,
             'remarks' => $followup->remarks,
             'status' => $followup->company ? $followup->company->status : null
         ];
         
         $followup->delete();

         // Log followup deleted
         ActivityLogger::log('followup.deleted', 'App\\Models\\FollowUp', 'Follow-up deleted', $logData);
         return $this->sendResponse([], "Followup deleted successfully");
    }

    public function allFollowup(): JsonResponse
    {
      
        // Retrieve all companies.
        $followup = FollowUp::all();
    
        return $this->sendResponse(
            ["Followup" => FollowupResource::collection($followup)],
            "Followup retrieved successfully"
        );
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $followup = FollowUp::find($id);

        if (!$followup) {
            return $this->sendError("Followup not found", ['error' => 'Followup not found']);
        }

        // Validate the status
        $request->validate([
            'status' => 'required|string|in:waiting,interested,not_interested,follow_up'
        ]);

        // Update the status in the related company
        if ($followup->company) {
            $followup->company->status = $request->input('status');
            $followup->company->save();

            // Log status update
            ActivityLogger::log('followup.status_updated', $followup, 'Follow-up status updated', [
                'company_id' => $followup->company_id,
                'company_name' => $followup->company->company_name,
                'remarks' => $followup->remarks,
                'status' => $request->input('status'),
                'new_status' => $request->input('status')
            ]);

            return $this->sendResponse(
                ['status' => $request->input('status')],
                "Status updated successfully"
            );
        }

        return $this->sendError("Company not found for this followup", ['error' => 'Company not found']);
    }

}
