<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Mail;
use PragmaRX\Google2FA\Google2FA;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

class TwoFactorController extends Controller
{
    protected $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    /**
     * Generate 2FA secret and QR code
     */
    public function generate(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            // Generate a new secret
            $secret = $this->google2fa->generateSecretKey();

            // Store the secret temporarily (not enabling yet)
            $user->google2fa_secret = $secret;
            $user->save();

            // Generate QR code URL
            $qrCodeUrl = $this->google2fa->getQRCodeUrl(
                config('app.name'),
                $user->email,
                $secret
            );

            // Generate SVG QR code
            $renderer = new ImageRenderer(
                new RendererStyle(200),
                new SvgImageBackEnd()
            );
            $writer = new Writer($renderer);
            $qrCodeSvg = $writer->writeString($qrCodeUrl);

            return response()->json([
                'status' => true,
                'message' => '2FA secret generated successfully.',
                'data' => [
                    'secret' => $secret,
                    'qr_code_svg' => $qrCodeSvg,
                    'qr_code_url' => $qrCodeUrl,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error generating 2FA secret.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify OTP and enable 2FA
     */
    public function enable(Request $request): JsonResponse
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        try {
            $user = Auth::user();

            if (empty($user->google2fa_secret)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Please generate 2FA secret first.'
                ], 400);
            }

            // Verify the OTP
            $valid = $this->google2fa->verifyKey($user->google2fa_secret, $request->otp);

            if (!$valid) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid OTP code.'
                ], 400);
            }

            // Enable 2FA
            $user->enableTwoFactor($user->google2fa_secret);

            // Log activity
            ActivityLogger::log('2fa_enabled', $user, 'User enabled two-factor authentication');

            return response()->json([
                'status' => true,
                'message' => '2FA enabled successfully.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error enabling 2FA.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify OTP and disable 2FA
     */
    public function disable(Request $request): JsonResponse
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        try {
            $user = Auth::user();

            if (!$user->hasTwoFactorEnabled()) {
                return response()->json([
                    'status' => false,
                    'message' => '2FA is not enabled.'
                ], 400);
            }

            // Verify the OTP before disabling
            $valid = $this->google2fa->verifyKey($user->google2fa_secret, $request->otp);

            if (!$valid) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid OTP code.'
                ], 400);
            }

            // Disable 2FA
            $user->disableTwoFactor();

            // Log activity
            ActivityLogger::log('2fa_disabled', $user, 'User disabled two-factor authentication');

            return response()->json([
                'status' => true,
                'message' => '2FA disabled successfully.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error disabling 2FA.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify OTP during login
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        try {
            $user = \App\Models\User::where('email', $request->email)->first();

            if (!$user || !$user->hasTwoFactorEnabled()) {
                return response()->json([
                    'status' => false,
                    'message' => 'User not found or 2FA not enabled.'
                ], 400);
            }

            // Verify the OTP
            $valid = $this->google2fa->verifyKey($user->google2fa_secret, $request->otp);

            if (!$valid) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid OTP code.'
                ], 400);
            }

            // Create token after successful verification
            $token = $user->createToken($user->name, ['*'], now()->addMinutes(env('SESSION_LIFETIME', 120)))->plainTextToken;

            // Log login activity
            ActivityLogger::log('login', $user, 'User logged in with 2FA');

            return response()->json([
                'status' => true,
                'message' => 'OTP verified successfully.',
                'data' => [
                    'user' => $user,
                    'token' => $token
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error verifying OTP.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check 2FA status
     */
    public function status(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            return response()->json([
                'status' => true,
                'data' => [
                    'enabled' => $user->hasTwoFactorEnabled(),
                    'enabled_at' => $user->google2fa_enabled_at,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error fetching 2FA status.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Request to disable 2FA via email (for lost phone)
     */
    public function requestDisableViaEmail(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user->hasTwoFactorEnabled()) {
                return response()->json([
                    'status' => false,
                    'message' => '2FA is not enabled.'
                ], 400);
            }

            // Check rate limiting - max 3 attempts per hour
            $cacheKey = 'disable_2fa_email_attempts_' . $user->id;
            $attempts = \Cache::get($cacheKey, 0);
            
            if ($attempts >= 3) {
                \Log::warning('Disable 2FA email rate limit exceeded', ['email' => $user->email]);
                return response()->json([
                    'status' => false,
                    'message' => 'Too many attempts. Please try again after 1 hour.'
                ], 429);
            }

            // Generate the current OTP from the user's secret
            $currentOtp = $this->google2fa->getCurrentOtp($user->google2fa_secret);
            
            // Store attempt count
            \Cache::put($cacheKey, $attempts + 1, 3600); // Expires in 1 hour

            // Get the backup email from config or use user's email
            $backupEmail = config('otp.backup_email');
            if (empty($backupEmail)) {
                $backupEmail = $user->email;
            }
            
            // Send email with OTP code
            Mail::send('emails.disable-2fa-otp', [
                'user' => $user,
                'otp' => $currentOtp,
                'validFor' => '30 seconds'
            ], function($message) use ($backupEmail) {
                $message->to($backupEmail)
                    ->subject('Your Code to Disable Two-Factor Authentication - ' . config('app.name'));
            });

            // Log activity
            ActivityLogger::log('2fa_disable_otp_sent', $user, 'User requested OTP to disable 2FA via email');
            \Log::info('Disable 2FA OTP sent via email', ['email' => $user->email, 'backup_email' => $backupEmail]);

            return response()->json([
                'status' => true,
                'message' => 'A 6-digit code has been sent to your registered email. Please enter it to disable 2FA.',
                'email_masked' => $this->maskEmail($backupEmail)
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error sending verification code.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify email link and disable 2FA
     */
    public function disableViaEmail(Request $request, $user): JsonResponse
    {
        try {
            // Find user
            $user = \App\Models\User::findOrFail($user);

            if (!$user->hasTwoFactorEnabled()) {
                return response()->json([
                    'status' => false,
                    'message' => '2FA is already disabled.'
                ], 400);
            }

            // Disable 2FA
            $user->disableTwoFactor();

            // Log activity
            ActivityLogger::log('2fa_disabled_via_email', $user, 'User disabled 2FA via email verification');

            return response()->json([
                'status' => true,
                'message' => '2FA has been disabled successfully. You can now log in without the authenticator app.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error disabling 2FA.',
                'error' => $e->getMessage()
            ], 500);
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
