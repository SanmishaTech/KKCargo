<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Models\Permission;

class GeneratePermissions extends Command
{
    protected $signature = 'permissions:generate';
    protected $description = 'Generate permissions based on route names';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        // Get all route names
        $routes = Route::getRoutes();
        $permissions = [];

        foreach ($routes as $route) {
            $name = $route->getName();
            // Filter out unexpected route names
            if ($name && !str_starts_with($name, 'generated::') && !str_contains($name, 'sanctum') && !str_contains($name, 'create') && !str_contains($name, 'edit')) {
                $permissions[] = $name;
            }
        }

        // Create permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $this->info('Permissions have been generated successfully.');
    }
}
