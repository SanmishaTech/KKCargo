<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Carbon;
use App\Models\ActivityLog;
use Barryvdh\DomPDF\Facade\Pdf;

class SendActivityReport extends Command
{
    protected $signature = 'activity:email-report {--date=}';
    protected $description = 'Send the daily activity log report via email';

    public function handle(): int
    {
        $dateOption = $this->option('date');
        try {
            if ($dateOption) {
                $reportDate = Carbon::parse($dateOption)->startOfDay();
            } else {
                // Default to yesterday's date to send a complete day summary
                $reportDate = Carbon::yesterday()->startOfDay();
            }
        } catch (\Exception $e) {
            $this->error('Invalid date format. Use YYYY-MM-DD.');
            return Command::INVALID;
        }

        $start = $reportDate->copy()->startOfDay();
        $end   = $reportDate->copy()->endOfDay();

        $logs = ActivityLog::with('user')
            ->whereBetween('created_at', [$start, $end])
            ->orderBy('created_at', 'asc')
            ->get();

        $summary = [
            'date' => $reportDate->toDateString(),
            'total' => $logs->count(),
            'by_action' => $logs->groupBy('action')->map->count()->sortDesc(),
            'by_user' => $logs->groupBy('user_id')->map(function ($items, $userId) {
                $name = optional(optional($items->first())->user)->name ?: 'System';
                return ['name' => $name, 'count' => $items->count()];
            })->sortByDesc('count'),
            'latest' => $logs->take(20),
        ];

        // Get recipients from environment variable
        $recipients = explode(',', env('ACTIVITY_LOG_RECIPIENTS'));

        // Generate PDF
        $pdf = Pdf::loadView('pdf.activity_report', ['summary' => $summary]);
        $pdfContent = $pdf->output();
        $fileName = 'daily-activity-report-' . $summary['date'] . '.pdf';

        Mail::send('emails.activity_report_simple', ['summary' => $summary], function ($message) use ($recipients, $summary, $pdfContent, $fileName) {
            $message->to($recipients)
                ->subject('Daily Activity Report - ' . $summary['date'])
                ->attachData($pdfContent, $fileName, [
                    'mime' => 'application/pdf',
                ]);
        });

        $this->info('Daily activity report sent for ' . $summary['date']);
        return Command::SUCCESS;
    }
}

