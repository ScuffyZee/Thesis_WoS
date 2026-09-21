<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => fn () => $user ? [
                    'id'       => $user->id,
                    'name'     => $user->name,
                    'username' => $user->username,
                    'email'    => $user->email,
                    'role'     => $user->role,
                    'avatar'   => $user->avatar,
                ] : null,
                'role' => fn () => $user?->role,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
