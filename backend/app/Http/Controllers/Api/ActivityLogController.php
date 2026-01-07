<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseController;
use App\Models\ActivityLog;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class ActivityLogController extends BaseController
{
    /**
     * Send activity report email for a specific date (defaults to today).
     */
    public function sendReport(Request $request): JsonResponse
    {
        // Admin-only
        $user = $request->user();
        if (!$user || !method_exists($user, 'hasRole') || !$user->hasRole('admin')) {
            return $this->sendError('Forbidden', ['error' => 'Only admin can trigger report'], 403);
        }

        // Validate optional date
        $validator = Validator::make($request->all(), [
            'date' => 'sometimes|date',
        ]);
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        try {
            $reportDate = $request->filled('date')
                ? Carbon::parse($request->input('date'))->startOfDay()
                : Carbon::today()->startOfDay();
        } catch (\Exception $e) {
            return $this->sendError('Invalid date', ['error' => 'Use YYYY-MM-DD'], 422);
        }

        $start = $reportDate->copy()->startOfDay();
        $end   = $reportDate->copy()->endOfDay();

        $logs = ActivityLog::with('user')
            ->whereBetween('created_at', [$start, $end])
            ->orderBy('created_at', 'desc')
            ->get();

        $latest = $logs->take(20)->values();

        $companyIds = $latest
            ->map(function ($log) {
                $properties = is_array($log->properties) ? $log->properties : [];
                $companyId = $properties['company_id'] ?? null;

                if (!$companyId && $log->subject_type === Company::class && $log->subject_id) {
                    $companyId = $log->subject_id;
                }

                return $companyId;
            })
            ->filter()
            ->unique()
            ->values();

        $companiesById = $companyIds->isNotEmpty()
            ? Company::whereIn('id', $companyIds)->get()->keyBy('id')
            : collect();

        $latest = $latest->map(function ($log) use ($companiesById) {
            $properties = is_array($log->properties) ? $log->properties : [];
            $companyId = $properties['company_id'] ?? null;

            if (!$companyId && $log->subject_type === Company::class && $log->subject_id) {
                $companyId = $log->subject_id;
                $properties['company_id'] = $companyId;
            }

            $company = $companyId ? $companiesById->get($companyId) : null;

            if ($company) {
                if (empty($properties['company_name'])) {
                    $properties['company_name'] = $company->company_name;
                }
                if (empty($properties['company_type']) && empty($properties['type_of_company'])) {
                    $properties['company_type'] = $company->type_of_company;
                }
                if (empty($properties['status']) && empty($properties['new_status'])) {
                    $properties['status'] = $company->status;
                }
            }

            $log->properties = $properties;
            return $log;
        });

        $summary = [
            'date' => $reportDate->toDateString(),
            'total' => $logs->count(),
            'by_action' => $logs->groupBy('action')->map->count()->sortDesc(),
            'by_user' => $logs->groupBy('user_id')->map(function ($items, $userId) {
                $name = optional(optional($items->first())->user)->name ?: 'System';
                return ['name' => $name, 'count' => $items->count()];
            })->sortByDesc('count'),
            'latest' => $latest,
        ];

        // Get recipients from config (works with config caching) and sanitize
        $recipients = array_values(array_filter(
            array_map('trim', explode(',', (string) config('activity.log_recipients', ''))),
            fn ($email) => filter_var($email, FILTER_VALIDATE_EMAIL)
        ));

        if (empty($recipients)) {
            return $this->sendError('Configuration Error', ['error' => 'No valid ACTIVITY_LOG_RECIPIENTS configured in .env'], 422);
        }

        try {
            // Generate PDF
            $pdf = Pdf::loadView('pdf.activity_report', ['summary' => $summary]);
            $pdfContent = $pdf->output();
            $fileName = 'daily-activity-report-' . $summary['date'] . '.pdf';

            // Send email with PDF attachment
            Mail::send('emails.activity_report', ['summary' => $summary], function ($message) use ($recipients, $summary, $pdfContent, $fileName) {
                $message->to($recipients)
                    ->subject('Daily Activity Report - ' . $summary['date'])
                    ->attachData($pdfContent, $fileName, [
                        'mime' => 'application/pdf',
                    ]);
            });
        } catch (\Exception $e) {
            return $this->sendError('Mail Error', ['error' => $e->getMessage()], 500);
        }

        return $this->sendResponse([], 'Activity report sent');
    }

    /**
     * List activity logs (admin only) with filters and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        // Enforce admin-only access at controller-level for robustness
        $user = $request->user();
        if (!$user || !method_exists($user, 'hasRole') || !$user->hasRole('admin')) {
            return $this->sendError('Forbidden', ['error' => 'Only admin can access activity logs'], 403);
        }

        $validator = Validator::make($request->all(), [
            'date_from'   => 'sometimes|date',
            'date_to'     => 'sometimes|date',
            'user_id'     => 'sometimes|integer|exists:users,id',
            'action'      => 'sometimes|string',
            'subject_type'=> 'sometimes|string',
            'subject_id'  => 'sometimes|integer',
            'search'      => 'sometimes|string',
            'sort'        => 'sometimes|in:asc,desc',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        $q = ActivityLog::query()->with('user');

        if ($request->filled('user_id')) {
            $q->where('user_id', $request->user_id);
        }
        if ($request->filled('action')) {
            $q->where('action', $request->action);
        }
        if ($request->filled('subject_type')) {
            $q->where('subject_type', $request->subject_type);
        }
        if ($request->filled('subject_id')) {
            $q->where('subject_id', $request->subject_id);
        }
        if ($request->filled('date_from')) {
            $q->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $q->whereDate('created_at', '<=', $request->date_to);
        }
        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $q->where(function($sub) use ($term) {
                $sub->where('description', 'like', $term)
                    ->orWhere('properties', 'like', $term)
                    ->orWhere('ip_address', 'like', $term)
                    ->orWhere('user_agent', 'like', $term);
            });
        }

        $sort = $request->input('sort', 'desc');
        $q->orderBy('created_at', $sort === 'asc' ? 'asc' : 'desc');

        $logs = $q->paginate(10);

        // Transform for frontend simplicity
        $collection = $logs->getCollection()->map(function ($log) {
            return [
                'id'           => $log->id,
                'created_at'   => $log->created_at,
                'user_id'      => $log->user_id,
                'user_name'    => optional($log->user)->name,
                'action'       => $log->action,
                'subject_type' => $log->subject_type,
                'subject_id'   => $log->subject_id,
                'description'  => $log->description,
                'properties'   => $log->properties,
                'ip_address'   => $log->ip_address,
            ];
        });
        $logs->setCollection($collection);

        return response()->json([
            'status' => true,
            'message' => 'Activity logs retrieved successfully',
            'data' => [
                'ActivityLogs' => $logs,
                'Pagination' => [
                    'current_page' => $logs->currentPage(),
                    'last_page'    => $logs->lastPage(),
                    'per_page'     => $logs->perPage(),
                    'total'        => $logs->total(),
                ],
            ],
        ], 200);
    }
}

