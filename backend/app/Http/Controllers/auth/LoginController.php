<?php

namespace App\Http\Controllers\auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    /**
     * Login user and create token
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        try {
            // Create token (assuming you're using Laravel Sanctum or similar)
            $token = $user->createToken('auth_token')->plainTextToken;
        } catch (\Exception $e) {
            // If token creation fails, return user data without token for now
            return response()->json([
                'success' => true,
                'message' => 'Login successful (no token)',
                'user' => $user,
                'token' => null
            ], 200);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token
        ], 200);
    }

    /**
     * Logout user (revoke token)
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout successful'
        ], 200);
    }

    /**
     * Get authenticated user profile
     */
    public function profile(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $request->user()
        ], 200);
    }

    /**
     * Update authenticated user profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        // Dynamic validation - only validate fields that are actually sent
        $rules = [];
        
        if ($request->has('name')) {
            $rules['name'] = 'required|string|max:255';
        }
        if ($request->has('phone_number')) {
            $rules['phone_number'] = 'required|string|max:20';
        }
        if ($request->has('location')) {
            $rules['location'] = 'required|string|max:255';
        }
        if ($request->has('date_of_birth')) {
            $rules['date_of_birth'] = 'required|date';
        }
        if ($request->has('blood_group')) {
            $rules['blood_group'] = 'required|string|in:A,B,AB,O';
        }
        if ($request->has('blood_type')) {
            $rules['blood_type'] = 'required|string|in:+,-';
        }
        if ($request->hasFile('profile_photo')) {
            $rules['profile_photo'] = 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120';
        }

        // Only validate if at least one field is being updated
        if (empty($rules)) {
            return response()->json([
                'success' => false,
                'message' => 'No fields provided for update'
            ], 400);
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Update only the fields that are provided
            if ($request->has('name')) {
                $user->name = $request->name;
            }
            if ($request->has('phone_number')) {
                $user->phone_number = $request->phone_number;
            }
            if ($request->has('location')) {
                $user->location = $request->location;
            }
            if ($request->has('date_of_birth')) {
                $user->date_of_birth = $request->date_of_birth;
            }
            if ($request->has('blood_group')) {
                $user->blood_group = $request->blood_group;
            }
            if ($request->has('blood_type')) {
                $user->blood_type = $request->blood_type;
            }

            // Handle profile photo upload
            if ($request->hasFile('profile_photo')) {
                $file = $request->file('profile_photo');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('profile_photos'), $filename);
                $user->profile_photo = 'profile_photos/' . $filename;
            }

            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => $user
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile: ' . $e->getMessage()
            ], 500);
        }
    }
}
