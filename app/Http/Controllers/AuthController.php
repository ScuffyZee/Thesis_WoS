<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        // Find user by username field
        $user = User::where('username', $request->username)->first();

        if (! $user || ! Auth::attempt(
            ['email' => $user->email, 'password' => $request->password],
            $request->boolean('remember'),
        )) {
            return back()->withErrors([
                'username' => 'Invalid username or password.',
            ])->onlyInput('username');
        }

        $request->session()->regenerate();

        return redirect()->route('dashboard');
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
