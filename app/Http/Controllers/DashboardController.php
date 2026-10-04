<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WorkOrder;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $totalUsers = User::count();

        return Inertia::render('dashboard', [
            // ── Static stats (always included) ──────────────────────────────
            'stats' => [
                'total_users'   => $totalUsers,
                'administrators' => User::where('role', 'admin')->count(),
                'tech_support'   => User::where('role', 'tech_support')->count(),
            ],

            // ── Live work order data (partial-reload targets) ────────────────
            'pendingOrders' => Inertia::lazy(fn () =>
                WorkOrder::where('status', 'pending')
                    ->orderByRaw("CASE priority
                        WHEN 'urgent' THEN 1
                        WHEN 'high'   THEN 2
                        WHEN 'medium' THEN 3
                        WHEN 'low'    THEN 4
                        ELSE 5 END")
                    ->orderBy('priority_score', 'desc')
                    ->orderBy('created_at', 'asc')
                    ->limit(10)
                    ->get(['id', 'order_number', 'requestor_name', 'requestor_department', 'campus', 'category', 'priority', 'created_at'])
            ),

            'activeOrders' => Inertia::lazy(function () {
                $user  = auth()->user();
                $query = WorkOrder::whereIn('status', ['in_progress', 'alternative', 'contracted'])
                    ->orderBy('created_at', 'desc')
                    ->limit(10);

                // Tech support only sees work orders assigned to them
                if ($user?->role === 'tech_support') {
                    $query->where('assigned_to', $user->name);
                }

                return $query->get(['id', 'order_number', 'requestor_name', 'requestor_department', 'campus', 'category', 'priority', 'status', 'assigned_to', 'created_at']);
            }),
        ]);
    }
}
