<?php

namespace Database\Seeders;

 
 use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
 use Spatie\Permission\Models\Permission;
 
class CreateStaffUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or retrieve the cashier role
        $role = Role::firstOrCreate(['name' => 'staff']);     

        // Assign all permissions to the cashier role
        $permissions = Permission::pluck('id', 'id')->all();
        $role->syncPermissions($permissions);
    }
}