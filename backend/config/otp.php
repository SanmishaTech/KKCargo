<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Backup OTP Email Configuration
    |--------------------------------------------------------------------------
    |
    | This email address will receive backup OTP codes when users lose access
    | to their authenticator app. If not set, OTP will be sent to the user's
    | registered email address.
    |
    */
    'backup_email' => env('BACKUP_OTP_EMAIL', null), // null means send to user's own email
    
    /*
    |--------------------------------------------------------------------------
    | OTP Rate Limiting
    |--------------------------------------------------------------------------
    |
    | Maximum number of OTP email attempts allowed per hour
    |
    */
    'max_attempts_per_hour' => 3,
    
    /*
    |--------------------------------------------------------------------------
    | OTP Validity
    |--------------------------------------------------------------------------
    |
    | How long the OTP is valid (in seconds)
    |
    */
    'validity_seconds' => 30,
];