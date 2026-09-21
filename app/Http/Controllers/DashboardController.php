<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $totalUsers = User::count();

        return Inertia::render('dashboard', [
            'stats' => [
                'total_users' => $totalUsers,
                'administrators' => max(0, (int) round($totalUsers * 0.4)),
                'tech_support' => max(0, (int) round($totalUsers * 0.5)),
            ],
        ]);
    }
}
