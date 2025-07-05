<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Staff;
use App\Models\Company;
use App\Models\FollowUp;
 
use Carbon\Carbon;    // For date calculations
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Fetch consolidated data for the dashboard.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user || !$user->staff) {
                return response()->json([
                    'status' => false,
                    'message' => 'User or staff details not found. Unable to load dashboard data.'
                ], 401); 
            }
            $staff = Staff::all();

            // Get the next upcoming follow-up date
            $nextUpcomingFollowUp = FollowUp::where('next_follow_up_date', '>=', Carbon::now())
                ->orderBy('next_follow_up_date', 'asc')
                ->first();

            $followUpsQuery = FollowUp::with('company');

            if ($request->has('company_name')) {
                $followUpsQuery->whereHas('company', function ($query) use ($request) {
                    $query->where('company_name', 'like', '%' . $request->company_name . '%');
                });
            }

            return response()->json([
                'status' => true,
                'data' => [
                    'staff_summary' => [
                        'total_staff' => $staff->count(),
                        'company_count' => Company::count()
                    ],
                    'next_upcoming_follow_up' => $nextUpcomingFollowUp ? $nextUpcomingFollowUp->next_follow_up_date : null,
                    'follow_ups' => tap($followUpsQuery->orderBy('follow_up_date', 'asc')->simplePaginate(7), function ($paginator) {
                        return $paginator->getCollection()->transform(function ($followUp) {
                            return [
                                'id' => $followUp->id,
                                'company_name' => $followUp->company ? $followUp->company->company_name : 'N/A',
                                'follow_up_date' => $followUp->follow_up_date,
                                'next_follow_up_date' => $followUp->next_follow_up_date,
                                'follow_up_type' => $followUp->follow_up_type,
                                'status' => $followUp->company ? $followUp->company->status : 'N/A',
                            ];
                        });
                    })
                ]
            ], 200);

        } catch (\Exception $e) {
            
            return response()->json([
                'status' => false,
                'message' => 'Error fetching dashboard data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
