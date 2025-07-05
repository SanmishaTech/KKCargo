<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class RunCommands extends Command
{
    protected $signature = 'all';
    protected $description = 'Run a series of PHP commands in sequence';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
{
    
    $commands = [
        'optimize',      
        'permissions:generate',      
        'db:seed',  
        'optimize',     
    ];

    foreach ($commands as $command) {
        $this->info("Running: {$command}");
        $exitCode = $this->call($command);

        if ($exitCode !== 0) {
            $this->error("Command failed: {$command}");
            break; // Stop if a command fails
        } else {
            $this->info("Command succeeded: {$command}");
        }
    }

    $this->info('All commands executed.');
}
}