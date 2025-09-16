<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\FollowUpController;
use App\Http\Controllers\Api\DashboardController; 
use App\Http\Controllers\Api\ActivityLogController;


 

Route::post('/login', [UserController::class, 'login']);


Route::group(['middleware'=>['auth:sanctum', 'permission','request.null']], function(){
   
  
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



});

 

 
 

 
 

 
 
