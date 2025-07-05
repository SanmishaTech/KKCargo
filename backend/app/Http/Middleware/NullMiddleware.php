<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NullMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Preserve file inputs by retrieving them separately
        $files = $request->file();
        // Retrieve all other input data (excluding files)
        $input = $request->except(array_keys($files));

        // Iterate over each non-file input field
        foreach ($input as $key => $value) {
            // Ensure the value is a string before checking for "null", empty, or "undefined"
            if (is_string($value) && ($value === "null" || $value === "" || $value === "undefined")) {
                $input[$key] = null;
            }
        }

        // Merge the updated input data back into the request
        $request->merge($input);

        return $next($request);
    }
}
















//  // Retrieve all non-file input data
//        // $input = $request->except($request->file());
//         // Retrieve all input data, including files
//         $input = $request->all();

//         // Iterate over each input field
//         foreach ($input as $key => $value) {
//             // Ensure the value is a string before checking for "null", empty, or "undefined"
//             if (is_string($value) && ($value === "null" || $value === "" || $value === "undefined")) {
//                 $input[$key] = null;
//             }
//         }

//         // Merge the updated input data back into the request
//         $request->merge($input);

//         return $next($request);