<?php

namespace App\Http\Controllers\Api;

use Validator;
use App\Models\User;
use App\Models\Staff;
use App\Models\Profile;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\StaffResource;
use App\Http\Resources\ProfileResource;
use App\Http\Resources\EmployeeResource;
use App\Http\Controllers\Api\BaseController;
use App\Services\ActivityLogger;

class UserController extends BaseController
{

     /**
     * Login User
     */
    public function login(Request $request): JsonResponse
    {
        // Log raw request data for debugging
        \Log::info('Login Request Raw Data:', $request->all());
        
        // Pre-process OTP if it exists - trim spaces
        $data = $request->all();
        if (isset($data['otp']) && $data['otp'] !== null) {
            $data['otp'] = trim($data['otp']);
            \Log::info('OTP after trim: "' . $data['otp'] . '" (length: ' . strlen($data['otp']) . ')');
        }
        
        $validator = Validator::make($data, [
            'email'=>['required','email'],
            'password'=>['required','string','min:6'],
            'otp'=>['nullable','string','size:6'],
        ]);

        if($validator->fails()){
           return $this->sendError('Validation Error.', $validator->errors());
        }

        if(Auth::attempt(['email' => $data['email'], 'password' => $data['password']])){
            $user = Auth::user();
            
            // Check if user has 2FA enabled
            if($user->hasTwoFactorEnabled()){
                // If OTP is provided and not empty, verify it
                if(isset($data['otp']) && !empty($data['otp'])){
                    $google2fa = new \PragmaRX\Google2FA\Google2FA();
                    $otpValue = $data['otp']; // Already trimmed above
                    
                    // Log for debugging
                    \Log::info('2FA Login Attempt', [
                        'email' => $user->email,
                        'otp_provided' => $otpValue,
                        'otp_length' => strlen($otpValue)
                    ]);
                    
                    $valid = $google2fa->verifyKey($user->google2fa_secret, $otpValue);
                    
                    if(!$valid){
                        Auth::logout();
                        \Log::warning('2FA Login Failed - Invalid OTP', ['email' => $user->email]);
                        return $this->sendError('Invalid OTP code.', ['error'=>'Invalid OTP code']);
                    }
                    
                    // OTP is valid, proceed with login
                    $token = $user->createToken($user->name)->plainTextToken;
                    $staff = Staff::where('user_id', $user->id)->first();
                    // Log login activity
                    ActivityLogger::log('login', $user, 'User logged in with 2FA');
                    \Log::info('2FA Login Success', ['email' => $user->email]);
                    
                    return $this->sendResponse(['User'=>new UserResource($user), 'token'=>$token], 'User login successfully.');
                } else {
                    // 2FA is enabled but OTP not provided
                    Auth::logout();
                    \Log::info('2FA Required', ['email' => $user->email, 'otp_in_request' => isset($data['otp'])]);
                    return response()->json([
                        'status' => true,
                        'requires_2fa' => true,
                        'message' => 'Please enter your 2FA code.',
                        'data' => [
                            'email' => $user->email
                        ]
                    ], 200);
                }
            }
            
            // No 2FA, proceed with normal login
            $token =  $user->createToken($user->name)->plainTextToken;
            $staff = Staff::where('user_id', $user->id)->first();
            // Log login activity
            ActivityLogger::log('login', $user, 'User logged in');
            // dd($user->id);
            return $this->sendResponse(['User'=>new UserResource($user), 'token'=>$token], 'User login successfully.');
            
        } else{
            return $this->sendError('Invalid Credentials.', ['error'=>'Invalid Credentials']);
        }
    }

     /**
     * Logout User
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return $this->sendResponse([], 'User logged out successfully.');
    }

}