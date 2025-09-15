<?php

return [
    // Comma-separated list of recipient emails for activity reports
    'log_recipients' => env('ACTIVITY_LOG_RECIPIENTS', ''),

    // Default daily report time (HH:MM)
    'report_time' => env('ACTIVITY_LOG_REPORT_TIME', '12:00'),
];
