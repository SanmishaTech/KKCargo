<?php

use Illuminate\Support\Facades\Route;

// Route::get('/', function () {
//     return view('welcome');
// });



Route::get('{any}', function () {
    // return view('app');
   return file_get_contents(public_path('index.html'));
//    return file_get_contents('index.html');

})->where('any', '.*');