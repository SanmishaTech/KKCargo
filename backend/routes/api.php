<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\FollowUpController;
use App\Http\Controllers\Api\DashboardController; 
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\RolesController;
use App\Http\Controllers\Api\PermissionsController;
use App\Http\Controllers\Api\TwoFactorController;


 

Route::post('/login', [UserController::class, 'login']);

// Email backup OTP routes (public - no auth required for lost phone scenario)
Route::post('/otp/send-email', [\App\Http\Controllers\Api\EmailOTPController::class, 'sendBackupOTP']);
Route::post('/otp/verify-email', [\App\Http\Controllers\Api\EmailOTPController::class, 'verifyEmailOTP']);

// 2FA disable via email verification (public signed route)
Route::get('/2fa/disable-verify/{user}', [TwoFactorController::class, 'disableViaEmail'])
    ->middleware('signed')
    ->name('2fa.disable.verify');


Route::group(['middleware'=>['auth:sanctum', 'permission','request.null']], function(){
   
   // Two-Factor Authentication routes
   Route::prefix('2fa')->group(function() {
      Route::get('/status', [TwoFactorController::class, 'status'])->name('2fa.status');
      Route::post('/generate', [TwoFactorController::class, 'generate'])->name('2fa.generate');
      Route::post('/enable', [TwoFactorController::class, 'enable'])->name('2fa.enable');
      Route::post('/disable', [TwoFactorController::class, 'disable'])->name('2fa.disable');
      Route::post('/request-disable-email', [TwoFactorController::class, 'requestDisableViaEmail'])->name('2fa.request.disable.email');
   });
  
   Route::resource('staff', StaffController::class);
   Route::get('/all_staff', [StaffController::class, 'allStaffs'])->name("staffs.all");

      // Company custom routes (keep before resource to avoid conflict)
   Route::post('/companies/importCompany', [CompanyController::class, 'importCompany'])->name('companies.import');
   Route::get('/companies/download-template', [CompanyController::class, 'downloadTemplate'])->name('companies.download-template');
   Route::get('/all_companies', [CompanyController::class, 'allCompany'])->name("companys.all");
   // Send brochure route
   Route::post('/companies/send-brochure', [CompanyController::class, 'sendBrochure'])->name('companies.send-brochure');
    // Company types dropdown
   Route::get('/company-types', [CompanyController::class, 'types'])->name('companies.types');
   Route::delete('/company-types', [CompanyController::class, 'deleteType'])->name('companies.types.delete');
   // Company cities dropdown
   Route::get('/company-cities', [CompanyController::class, 'cities'])->name('companies.cities');
   // Company status update (must be before resource routes)
   Route::put('/companies/{id}/status', [CompanyController::class, 'updateStatus'])->name('companies.update-status');
   // Bulk delete companies
   Route::post('/companies/bulk-delete', [CompanyController::class, 'bulkDelete'])->name('companies.bulk-delete');
    // Company resource routes
   Route::resource('companies', CompanyController::class);
   //followup
   Route::resource('followup', FollowUpController::class);
   Route::get('/all_followup', [FollowUpController::class, 'allFollowup'])->name("followups.all");
   Route::put('/followup/{id}/status', [FollowUpController::class, 'updateStatus'])->name('followup.update-status');
   

   // Dashboard route
   Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.data');

   // Activity Logs (admin-only enforced in controller)
   Route::get('/activity-logs', [ActivityLogController::class, 'index'])->withoutMiddleware('permission')->name('activity-logs.index');
   Route::post('/activity-logs/send-report', [ActivityLogController::class, 'sendReport'])->withoutMiddleware('permission')->name('activity-logs.send-report');

   // Roles and Permissions Management (admin-only enforced in controller)
   Route::get('/roles', [RolesController::class, 'index'])->withoutMiddleware('permission')->name("roles.index");
   Route::get('/roles/{id}', [RolesController::class, 'show'])->withoutMiddleware('permission')->name("roles.show");
   Route::put('/roles/{id}', [RolesController::class, 'update'])->withoutMiddleware('permission')->name("roles.update");
  
   Route::get('/permissions', [PermissionsController::class, 'index'])->withoutMiddleware('permission')->name("permissions.index");
   Route::get('/generate_permissions', [PermissionsController::class, 'generatePermissions'])->withoutMiddleware('permission')->name("permissions.generate");



});

 

 
 

 
 

 
 
