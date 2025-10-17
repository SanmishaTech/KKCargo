<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use App\Models\User;
use PragmaRX\Google2FA\Google2FA;

class EmailOTPController extends BaseController
{
    protected $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    /**
     * Send backup OTP to email when user can't access their authenticator app
     */
    public function sendBackupOTP(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        try {
            $user = User::where('email', $request->email)->first();

            // Check if user has 2FA enabled
            if (!$user->hasTwoFactorEnabled()) {
                return $this->sendError('2FA is not enabled for this account.', ['error' => '2FA not enabled']);
            }

            // Check rate limiting - max 3 attempts per hour
            $cacheKey = 'email_otp_attempts_' . $user->id;
            $attempts = Cache::get($cacheKey, 0);
            
            $maxAttempts = config('otp.max_attempts_per_hour', 3);
            if ($attempts >= $maxAttempts) {
                \Log::warning('Email OTP rate limit exceeded', ['email' => $user->email]);
                return $this->sendError('Too many attempts. Please try again after 1 hour.', ['error' => 'Rate limit exceeded']);
            }

            // Generate the current OTP from the user's secret
            $currentOtp = $this->google2fa->getCurrentOtp($user->google2fa_secret);
            
            // Store attempt count
            Cache::put($cacheKey, $attempts + 1, 3600); // Expires in 1 hour

            // Get the backup email from config or use user's email
            $backupEmail = config('otp.backup_email');
            if (empty($backupEmail)) {
                $backupEmail = $user->email;
            }

            // Send email
            Mail::send('emails.backup-otp', [
                'user' => $user,
                'otp' => $currentOtp,
                'validFor' => '30 seconds'
            ], function($message) use ($backupEmail, $user) {
                $message->to($backupEmail)
                    ->subject('Your Backup Authentication Code - ' . config('app.name'));
            });

            // Log activity
            ActivityLogger::log('backup_otp_sent', $user, 'Backup OTP sent to email');
            \Log::info('Backup OTP sent via email', ['email' => $user->email, 'backup_email' => $backupEmail]);

            return $this->sendResponse([
                'message' => 'OTP has been sent to your registered email.',
                'email_masked' => $this->maskEmail($backupEmail)
            ], 'OTP sent successfully.');

        } catch (\Exception $e) {
            \Log::error('Error sending backup OTP', ['error' => $e->getMessage()]);
            return $this->sendError('Failed to send OTP. Please try again.', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Verify the email OTP (uses the same Google Authenticator OTP)
     */
    public function verifyEmailOTP(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6'
        ]);

        try {
            $user = User::where('email', $request->email)->first();

            if (!$user->hasTwoFactorEnabled()) {
                return $this->sendError('2FA is not enabled for this account.', ['error' => '2FA not enabled']);
            }

            // Verify the OTP
            $valid = $this->google2fa->verifyKey($user->google2fa_secret, trim($request->otp));

            if (!$valid) {
                \Log::warning('Invalid email OTP attempt', ['email' => $user->email]);
                return $this->sendError('Invalid OTP code.', ['error' => 'Invalid OTP']);
            }

            // Log successful verification
            ActivityLogger::log('email_otp_verified', $user, 'Email OTP verified successfully');
            \Log::info('Email OTP verified successfully', ['email' => $user->email]);

            return $this->sendResponse([
                'message' => 'OTP verified successfully.',
                'valid' => true
            ], 'OTP verified.');

        } catch (\Exception $e) {
            \Log::error('Error verifying email OTP', ['error' => $e->getMessage()]);
            return $this->sendError('Verification failed. Please try again.', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Mask email for privacy (show first 2 chars and domain)
     */
    private function maskEmail($email): string
    {
        $parts = explode('@', $email);
        if (count($parts) !== 2) {
            return '***@***.***';
        }
        
        $name = $parts[0];
        $domain = $parts[1];
        
        if (strlen($name) <= 2) {
            $masked = str_repeat('*', strlen($name));
        } else {
            $masked = substr($name, 0, 2) . str_repeat('*', strlen($name) - 2);
        }
        
        return $masked . '@' . $domain;
    }
}