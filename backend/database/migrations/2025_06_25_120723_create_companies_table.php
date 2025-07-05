<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('date')->nullable();
            $table->string('company_name')->nullable();
            $table->string('status')->nullable();
            $table->string('street_address')->nullable();
            $table->string('area')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('pincode')->nullable();
            $table->string('country')->nullable();
            $table->string('type_of_company')->nullable();
            $table->string('other_type_of_company')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('contact_person_designation')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_mobile')->nullable();
            $table->string('alternate_contact_person')->nullable();
            $table->string('alternate_contact_person_designation')->nullable();
            $table->string('alternate_contact_email')->nullable();
            $table->string('alternate_contact_mobile')->nullable();


            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
