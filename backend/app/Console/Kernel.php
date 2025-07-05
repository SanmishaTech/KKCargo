<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected $commands = [
        // Register your custom command here, like:
        
        \App\Console\Commands\RunCommands::class,
    ];

    protected function schedule(Schedule $schedule)
    {
        // You can schedule tasks here if needed.
    }

    protected function commands()
    {
        require base_path('routes/console.php');
    }
}