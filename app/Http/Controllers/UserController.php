<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role = $request->input('role')) {
            $query->where('role', $role);
        }

        $perPage = (int) $request->input('per_page', 10);

        $users = $query
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('user-accounts/index', [
            'users'   => $users,
            'filters' => $request->only(['search', 'role', 'per_page']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_if($request->user()?->role !== 'admin', 403, 'Only admins can manage user accounts.');

        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:50', 'unique:users,username'],
            'email'    => ['required', 'email', 'unique:users,email'],
            'phone'    => ['nullable', 'string', 'max:20'],
            'role'     => ['required', Rule::in(['admin', 'tech_support'])],
            'password' => ['required', 'string', 'min:8'],
        ]);

        User::create($validated);

        return redirect()->route('user-accounts.index')
            ->with('success', 'User account created successfully.');
    }

    public function update(Request $request, User $userAccount): RedirectResponse
    {
        abort_if($request->user()?->role !== 'admin', 403, 'Only admins can manage user accounts.');

        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:50', Rule::unique('users', 'username')->ignore($userAccount->id)],
            'email'    => ['required', 'email', Rule::unique('users', 'email')->ignore($userAccount->id)],
            'phone'    => ['nullable', 'string', 'max:20'],
            'role'     => ['required', 'in:admin,tech_support'],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $userAccount->update($validated);

        return redirect()->route('user-accounts.index')
            ->with('success', 'User account updated successfully.');
    }

    public function destroy(User $userAccount): RedirectResponse
    {
        abort_if(request()->user()?->role !== 'admin', 403, 'Only admins can manage user accounts.');

        $userAccount->delete();

        return redirect()->route('user-accounts.index')
            ->with('success', 'User account deleted.');
    }

    public function profile(Request $request): Response
    {
        return Inertia::render('my-profile', [
            'user' => $request->user(),
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'phone'     => ['nullable', 'string', 'max:20'],
            'username'  => ['required', 'string', 'max:50', Rule::unique('users', 'username')->ignore($user->id)],
            'password'  => ['nullable', 'string', 'min:8'],
            'role'      => ['required', 'in:admin,tech_support'],
            'avatar'    => ['nullable', 'image', 'max:2048'],
            'signature' => ['nullable', 'string'],
        ]);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        } else {
            unset($validated['avatar']);
        }

        // Keep existing password if blank
        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        // Save empty string signature as null
        if (isset($validated['signature']) && $validated['signature'] === '') {
            $validated['signature'] = null;
        }

        $user->update($validated);

        return back()->with('success', 'Profile updated successfully.');
    }
}
