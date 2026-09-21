<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Show the login page.
     * If already logged in, redirect straight to dashboard.
     */
    public function showLogin(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('welcome');
    }

    /**
     * Attempt login by username (looks up email, then authenticates).
     */
    public function login(Request $request): RedirectResponse
{
    $request->validate([
        'username' => ['required', 'string'],
        'password' => ['required', 'string'],
    ]);

    $user = User::where('username', $request->username)->first();

    if (!$user) {
        return back()->withErrors([
            'username' => 'DEBUG: User not found.',
        ])->onlyInput('username');
    }

    $passwordMatches = Hash::check(
        $request->password,
        $user->password
    );

    return back()->withErrors([
        'username' => 'DEBUG: User found. Password matches: '
            . ($passwordMatches ? 'YES' : 'NO'),
    ])->onlyInput('username');
}

    /**
     * Log out and return to login page.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
