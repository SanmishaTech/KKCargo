<?php
  
namespace App\Http\Controllers\Api;
  
use Illuminate\Http\Request;
use App\Http\Controllers\Controller as Controller;
use Illuminate\Http\JsonResponse;
  
class BaseController extends Controller
{
    /**
     * status response method.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendResponse($result, $message): JsonResponse
    {
        $response = [
            'status' => true,
            'message' => $message,
            'data'    => $result,
        ];
  
        return response()->json($response, 200);
    }
  
    /**
     * return error response.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendError($error, $errorMessages = [], $code = 401): JsonResponse
    {
        $response = [
            'status' => false,
            'message' => $error,
        ];
  
        if(!empty($errorMessages)){
            $response['errors'] = $errorMessages;
        }
  
        return response()->json($response, $code);
    }
}