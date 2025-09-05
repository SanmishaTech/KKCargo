<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected $commands = [
        // Register your custom command here, like:
        
        \App\Console\Commands\RunCommands::class,
        \App\Console\Commands\SendActivityReport::class,
    ];

    protected function schedule(Schedule $schedule)
    {
        // Daily activity report at configured time (default 12:00)
        $time = env('ACTIVITY_LOG_REPORT_TIME', '12:00');
        $schedule->command('activity:email-report')->dailyAt($time);
    }

    protected function commands()
    {
        require base_path('routes/console.php');
    }
}
