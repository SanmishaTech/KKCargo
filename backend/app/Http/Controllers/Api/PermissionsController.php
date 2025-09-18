<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;
use Spatie\Permission\Models\Permission;
use App\Http\Resources\PermissionResource;
use App\Http\Controllers\Api\BaseController;
use Illuminate\Support\Facades\Auth;

class PermissionsController extends BaseController
{
     /**
     * All Permissions.
     */
    public function index(Request $request): JsonResponse
    {
        // Check if user has admin role
        if (!Auth::user()->hasRole('admin')) {
            return $this->sendError('Unauthorized access', [], 403);
        }
        
        $query = Permission::query();
        
        if ($request->query('search')) {
            $searchTerm = $request->query('search');
    
            $query->where(function ($query) use ($searchTerm) {
                $query->where('name', 'like', '%' . $searchTerm . '%');
            });
        }
        $permissions = $query->orderBy("id", "DESC")->paginate(20);

        return $this->sendResponse(["Permissions"=>PermissionResource::collection($permissions),
        'pagination' => [
            'current_page' => $permissions->currentPage(),
            'last_page' => $permissions->lastPage(),
            'per_page' => $permissions->perPage(),
            'total' => $permissions->total(),
        ]], "Permissions retrieved successfully");
    }

     /**
     * Generate Permissions.
     */
    public function generatePermissions(): JsonResponse
    {
        // Check if user has admin role
        if (!Auth::user()->hasRole('admin')) {
            return $this->sendError('Unauthorized access', [], 403);
        }
        
        Artisan::call("optimize");

        Artisan::call("permissions:generate");
        // Artisan::call("db:seed");

       return $this->sendResponse([], "Permissions generated successfully");

    }

}