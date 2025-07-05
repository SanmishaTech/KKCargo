<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Staff;
    
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;

class CreateAdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or retrieve the superadmin user
        $user = User::updateOrCreate(
            ['email' => 'kk@gmail.com'],  
            [
                'name' => 'Admin',
                'password' => Hash::make('abcd123')  
            ]
        );

        // Create or retrieve the superadmin role
        $role = Role::firstOrCreate(['name' => 'admin']);
        
        // Retrieve all permissions and assign them to the superadmin role
        $permissions = Permission::all(); // Get all permissions
        $role->syncPermissions($permissions); // Sync all permissions to the role

        // Assign the superadmin role to the user
        $user->syncRoles([$role->id]);

        // Update or create the employee profile
        $staff = Staff::where('user_id', $user->id)->first();
        if ($staff) {
             $staff->email = $user->email;
            $staff->save();
            return;
        }

        $staff = new Staff();
        $staff->user_id = $user->id;
         $staff->email = $user->email;
        $staff->save();
    }
}