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
        try {
            $totalUsers     = User::count();
            $administrators = User::where('role', 'admin')->count();
            $techSupport    = User::where('role', 'tech_support')->count();
        } catch (\Throwable) {
            $totalUsers = $administrators = $techSupport = 0;
        }

        $user = auth()->user();

        $pendingOrders = WorkOrder::where('status', 'pending')
            ->orderByRaw("CASE priority
                WHEN 'urgent' THEN 1
                WHEN 'high'   THEN 2
                WHEN 'medium' THEN 3
                WHEN 'low'    THEN 4
                ELSE 5 END")
            ->orderBy('priority_score', 'desc')
            ->orderBy('created_at', 'asc')
            ->limit(10)
            ->get(['id', 'order_number', 'requestor_name', 'requestor_department', 'campus', 'category', 'priority', 'created_at']);

        $activeQuery = WorkOrder::whereIn('status', ['in_progress', 'alternative', 'contracted'])
            ->orderBy('created_at', 'desc')
            ->limit(10);

        // Tech support only sees work orders assigned to them
        if ($user?->role === 'tech_support') {
            $activeQuery->where('assigned_to', $user->name);
        }

        $activeOrders = $activeQuery->get(['id', 'order_number', 'requestor_name', 'requestor_department', 'campus', 'category', 'priority', 'status', 'assigned_to', 'created_at']);

        return Inertia::render('dashboard', [
            'stats' => [
                'total_users'    => $totalUsers,
                'administrators' => $administrators,
                'tech_support'   => $techSupport,
            ],
            'pendingOrders' => $pendingOrders,
            'activeOrders'  => $activeOrders,
        ]);
    }
}
