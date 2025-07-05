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

class UserController extends BaseController
{

     /**
     * Login User
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email'=>['required','email'],
            'password'=>['required','string','min:6'],
        ]);

        if($validator->fails()){
           return $this->sendError('Validation Error.', $validator->errors());
        }

        if(Auth::attempt(['email' => $request->email, 'password' => $request->password])){
            $user = Auth::user();
            $token =  $user->createToken($user->name)->plainTextToken;
            $staff = Staff::where('user_id', $user->id)->first();
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