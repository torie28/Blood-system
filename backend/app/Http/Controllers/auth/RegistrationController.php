<?php

namespace App\Http\Controllers\auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Hospital;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class RegistrationController extends Controller
{
    /**
     * Register a new user (donor or hospital staff).
     */
    public function register(Request $request)
    {
        $role = $request->input('role', 'donor');

        if ($role === 'hospital') {
            // Hospital staff registration
            $validator = Validator::make($request->all(), [
                'name'         => 'required|string|max:255',
                'email'        => 'required|string|email|max:255|unique:users',
                'password'     => 'required|string|min:8|confirmed',
                'phone_number' => 'required|string|max:20',
                'hospital_id'  => 'required|exists:hospitals,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors'  => $validator->errors(),
                ], 422);
            }

            $hospital = Hospital::find($request->hospital_id);

            $user = User::create([
                'name'         => $request->name,
                'email'        => $request->email,
                'password'     => Hash::make($request->password),
                'role'         => 'hospital',
                'hospital_id'  => $request->hospital_id,
                'location'     => $hospital->address ?? '',
                'phone_number' => $request->phone_number,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Hospital staff account registered successfully',
                'user'    => $user->load('hospital'),
            ], 201);
        }

        // Default: donor registration
        $validator = Validator::make($request->all(), [
            'name'         => 'required|string|max:255',
            'email'        => 'required|string|email|max:255|unique:users',
            'password'     => 'required|string|min:8|confirmed',
            'location'     => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
            'blood_group'  => 'required|string|in:A,B,AB,O',
            'blood_type'   => 'required|string|in:+,-',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name'         => $request->name,
            'email'        => $request->email,
            'password'     => Hash::make($request->password),
            'role'         => $role === 'admin' ? 'donor' : $role, // prevent self-promoting to admin
            'location'     => $request->location,
            'phone_number' => $request->phone_number,
            'blood_group'  => $request->blood_group,
            'blood_type'   => $request->blood_type,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'user'    => $user,
        ], 201);
    }
}
