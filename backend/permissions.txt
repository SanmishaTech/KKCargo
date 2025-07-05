<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class CreateMemberUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'ganesh@gmail.com'], // Search for user by email
            [
                'name' => 'ganesh',
                'password' => Hash::make('abcd123') // Hash the password
            ]
        );
    
         // Create or retrieve the admin role
        $role = Role::firstOrCreate(['name' => 'member']);     

        $permissions = [
            "permissions.index",
            "projects.index",
            "projects.show",
            "tasks.index",
            "tasks.store",
            "tasks.update",
            "tasks.show",
            "taskSubmissions.index",
            "taskSubmissions.store",
            "taskSubmissions.show",
            "taskSubmissions.update",
            "show.files",
            "user.logout",
        ];
        // $adminRole->givePermissionTo($permissions);

        $role->syncPermissions($permissions);
     
        $user->assignRole([$role->id]);
    }
}
