<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Staff;
use App\Models\StaffImage;
 
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Role;
use App\Http\Requests\StaffRequest;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\StaffResource;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Api\BaseController;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Log;
use Mpdf\Mpdf;

 
class StaffController extends BaseController
{

public function index(Request $request): JsonResponse
{
    // Start the query by filtering staff based on the institute_id.
    $query = Staff::query();

    // If there's a search term, apply additional filtering.
    if ($request->query('search')) {
        $searchTerm = $request->query('search');
        $query->where(function ($query) use ($searchTerm) {
            $query->where('staff_name', 'like', '%' . $searchTerm . '%');
        });
    }

    // Optional role filter (e.g., ?role=teachingstaff)
    if ($request->query('role')) {
        $roleFilter = $request->query('role');
        // Filter via Spatie roles relation on users -> roles.name
        $query->whereHas('user.roles', function ($q) use ($roleFilter) {
            $q->where('name', $roleFilter);
        });
    }

    // Paginate the results.
    $staff = $query->paginate(7);

    // Return the paginated response with staff resources.
    return response()->json(
        [
            'status' => true,
            'message' => "Staff retrieved successfully",
            'data' => [
                "Staff" => StaffResource::collection($staff),
                'Pagination' => [
                    'current_page' => $staff->currentPage(),
                    'last_page'    => $staff->lastPage(),
                    'per_page'     => $staff->perPage(),
                    'total'        => $staff->total(),
                ]
            ]
        ]
    );
}


    public function store(StaffRequest $request): JsonResponse
    {
        // Create a new user
        $active = 1;
        $user = new User();
        $user->name = $request->input('name');
        $user->email = $request->input('email');
        $user->active = $active;
        $user->password = Hash::make($request->input('password'));
        $user->save();
        
        // Assign the 'staff' role
        $roleName = $request->input('role', 'staff'); // Default to 'staff' if not specified
        $role = Role::where("name", $roleName)->first();
        $user->assignRole($role);
        
        // Create a new staff record
        $staff = new Staff();
        $staff->user_id = $user->id;
        $staff->staff_name = $request->input('staff_name');
        $staff->employee_code = $request->input('employee_code');
         $staff->date_of_birth = $request->input('date_of_birth');
        $staff->address = $request->input('address');
        $staff->email = $request->input('email');
        $staff->mobile = $request->input('mobile');
         $staff->save();

     
        
        return response()->json([
            'status' => true,
            'message' => "Staff stored successfully",
            'data' => [ "Staff" => new StaffResource($staff)]
        ]);
    }
    

    /**
     * Show Staff.
     */
    public function show(string $id): JsonResponse
    {
        $staff = Staff::find($id);

        if(!$staff){
            return response()->json([
                'status' => false,
                'message' => "Staff not found",
                'errors' => ['error'=>'Staff not found']
            ], 404);
        }

        $user = User::find($staff->user_id);
 
        return response()->json([
            'status' => true,
            'message' => "Staff retrieved successfully",
            'data' => [ "Staff" => new StaffResource($staff) ]
        ]);
    }

    /**
     * Update Staff.
     */
    public function update(StaffRequest $request, string $id): JsonResponse
    {
        $staff = Staff::find($id);

        if(!$staff){
            return response()->json([
                'status' => false,
                'message' => "Staff not found",
                'errors' => ['error'=>'Staff not found']
            ], 404);
        }

        $user = User::find($staff->user_id);
        $user->name = $request->input('name', $user->name);
        $user->email = $request->input('email');
        $user->active = $request->input('active', 1);
        
        // Only update password if a new one is provided
        if ($request->filled('password')) {
            $user->password = Hash::make($request->input('password'));
            \Log::info('Password updated for user ID: ' . $user->id);
        } else {
            // Keep the existing password by removing it from the fillable attributes
            $user->makeHidden('password');
        }
        
        $user->save();

        // Update user role
        $roleName = $request->input('role', 'staff'); // Default to 'staff' if not specified
        \Log::info('Updating role for user ' . $user->id . ' to: ' . $roleName);
        
        // Remove all current roles
        $user->roles()->detach();
        
        // Assign the new role
        $role = Role::where("name", $roleName)->first();
        if ($role) {
            $user->assignRole($role);
            \Log::info('Successfully assigned role: ' . $roleName);
        } else {
            \Log::error('Role not found: ' . $roleName);
        }
                       
        $staff->staff_name = $request->input('staff_name');
        $staff->employee_code = $request->input('employee_code');
         $staff->date_of_birth = $request->input('date_of_birth');
        $staff->address = $request->input('address');
        $staff->email = $request->input('email');
        $staff->mobile = $request->input('mobile');
         
        $staff->save();

      
       
        return response()->json([
            'status' => true,
            'message' => "Staff updated successfully",
            'data' => [ "Staff" => new StaffResource($staff)]
        ]);
    }

    /**
     * Remove Staff.
     */
    public function destroy(string $id): JsonResponse
    {
        $staff = Staff::find($id);
        if(!$staff){
            return response()->json([
                'status' => false,
                'message' => "Staff not found",
                'errors' => ['error'=> 'Staff not found']
            ], 404);
        }

     

        $user = User::find($staff->user_id);
        $staff->delete();
        $user->delete();
        return response()->json([
            'status' => true,
            'message' => "Staff deleted successfully",
            'data' => []
        ]);
    }

    public function displayDocuments(string $document){
        // Generate the full path to the file in the public storage
        $path = storage_path('app/public/staff_images/'.$document);
        
        // Log for debugging
        Log::info('Document requested: ' . $document);
        Log::info('Path being checked: ' . $path);
        Log::info('File exists: ' . (file_exists($path) ? 'Yes' : 'No'));

        // Check if the file exists
        if (!file_exists($path)) {
            // Try medical images path
            $medicalImagePath = storage_path('app/public/staff_medical_images/'.$document);
            Log::info('Trying medical image path: ' . $medicalImagePath);
            Log::info('File exists at medical image path: ' . (file_exists($medicalImagePath) ? 'Yes' : 'No'));
            
            if (file_exists($medicalImagePath)) {
                $path = $medicalImagePath;
            } else {
                // Try alternate path for events
                $alternatePath = storage_path('app/public/events/'.$document);
                Log::info('Trying alternate path: ' . $alternatePath);
                Log::info('File exists at alternate path: ' . (file_exists($alternatePath) ? 'Yes' : 'No'));
                
                if (file_exists($alternatePath)) {
                    $path = $alternatePath;
                } else {
                    return response()->json([
                        'status' => false,
                        'message' => "Document not found",
                        'errors' => ['error'=>['Document not found.']]
                    ], 404);
                }
            }
        }

        // Get the file content and MIME type
        $fileContent = File::get($path);
        $mimeType = File::mimeType($path);

        // Create the response for the file download
        $response = Response::make($fileContent, 200);
        $response->header("Content-Type", $mimeType);
        $response->header('Content-Disposition', 'inline; filename="' . $document . '"'); // Set to inline for viewing
        return $response;
    }

    public function allStaffs(): JsonResponse
    {
        // Filter staff 
        $staff = Staff::get();
    
        return response()->json([
            'status' => true,
            'message' => "Staff retrieved successfully",
            'data' => ["Staff" => StaffResource::collection($staff)]
        ]);
    }

    /**
     * Generate PDF of staff details.
     */
    public function pdf($id)
    {
        $staff = Staff::with(['education','papers'])->findOrFail($id);
        $date = now()->format('Y-m-d H:i:s'); // Or any other format you prefer
        $html = view('pdf.staff', compact('staff', 'date'))->render();

        // Create a new mPDF instance with A4 page format
        $mpdf = new Mpdf(['format' => 'A4']);

        // Write the HTML content into the PDF
        $mpdf->WriteHTML($html);

        // Output the PDF directly to the browser for download
        return $mpdf->Output('staff_' . $staff->id . '.pdf', 'D'); // Download the PDF
    }
}