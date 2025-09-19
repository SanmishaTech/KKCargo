<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use App\Http\Controllers\Api\ActivityLogController;
use Illuminate\Http\Request;
use App\Models\User;

class SendActivityReport extends Command
{
    protected $signature = 'activity:email-report {--date=}';
    protected $description = 'Send daily activity log report via email';

    public function handle(): int
    {
        $reportDate = $this->getReportDate();
        if (!$reportDate) {
            return Command::INVALID;
        }

        $adminUser = $this->getAdminUser();
        if (!$adminUser) {
            return Command::FAILURE;
        }

        return $this->sendReport($reportDate, $adminUser);
    }

    private function getReportDate(): ?string
    {
        $dateOption = $this->option('date');
        
        try {
            return $dateOption 
                ? Carbon::parse($dateOption)->format('Y-m-d')
                : Carbon::yesterday()->format('Y-m-d');
        } catch (\Exception $e) {
            $this->error('Invalid date format. Use YYYY-MM-DD.');
            return null;
        }
    }

    private function getAdminUser(): ?User
    {
        $adminUser = User::whereHas('roles', fn($query) => $query->where('name', 'admin'))->first();
        
        if (!$adminUser) {
            $this->error('No admin user found. Cannot send report.');
        }
        
        return $adminUser;
    }

    private function sendReport(string $reportDate, User $adminUser): int
    {
        $request = new Request(['date' => $reportDate]);
        $request->setUserResolver(fn() => $adminUser);

        try {
            $response = (new ActivityLogController())->sendReport($request);
            $responseData = $response->getData(true);
            
            if ($response->getStatusCode() === 200 && $responseData['status']) {
                $this->info("Daily activity report sent successfully for {$reportDate}");
                return Command::SUCCESS;
            }
            
            $this->error('Failed to send report: ' . ($responseData['message'] ?? 'Unknown error'));
            return Command::FAILURE;
        } catch (\Exception $e) {
            $this->error('Error sending report: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}

