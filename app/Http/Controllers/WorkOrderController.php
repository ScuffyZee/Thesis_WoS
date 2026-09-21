<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WorkOrder;
use App\Services\PriorityEngine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkOrderController extends Controller
{
    /**
     * Display the work order log list — split into two sections:
     * 1. Pending (unaccepted) — queued by priority score descending
     * 2. Active (accepted / in-progress and beyond)
     */
    public function index(Request $request): Response
    {
        $search   = $request->input('search');
        $campus   = $request->input('campus');
        $priority = $request->input('priority');
        $dateFrom = $request->input('date_from');
        $dateTo   = $request->input('date_to');
        $perPage  = (int) $request->input('per_page', 10);

        // ── Shared base query builder ─────────────────────────────────────────
        $base = function () use ($search, $campus, $priority, $dateFrom, $dateTo) {
            $q = WorkOrder::query()
                ->campus($campus)
                ->priority($priority);

            if ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('order_number', 'like', "%{$search}%")
                        ->orWhere('requestor_name', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%")
                        ->orWhere('assigned_to', 'like', "%{$search}%");
                });
            }

            if ($dateFrom) $q->whereDate('created_at', '>=', $dateFrom);
            if ($dateTo)   $q->whereDate('created_at', '<=', $dateTo);

            return $q;
        };

        // ── Section 1: Pending — sorted by priority score desc (queue order) ──
        $pendingOrders = $base()
            ->whereIn('status', ['pending'])
            ->orderByRaw("CASE priority
                WHEN 'urgent' THEN 1
                WHEN 'high'   THEN 2
                WHEN 'medium' THEN 3
                WHEN 'low'    THEN 4
                ELSE 5 END")
            ->orderBy('priority_score', 'desc')
            ->orderBy('created_at', 'asc')  // FIFO within same priority
            ->paginate($perPage, ['*'], 'pending_page')
            ->withQueryString();

        // ── Section 2: Active — in_progress, alternative, contracted ─────────
        $activeOrders = $base()
            ->whereIn('status', ['in_progress', 'alternative', 'contracted'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'active_page')
            ->withQueryString();

        return Inertia::render('work-orders/index', [
            'pendingOrders' => $pendingOrders,
            'activeOrders'  => $activeOrders,
            'filters'       => $request->only(['search', 'campus', 'priority', 'date_from', 'date_to', 'per_page']),
            'campuses'      => $this->campuses(),
            'priorities'    => $this->priorities(),
        ]);
    }

    /**
     * Show the form for logging a new work order.
     */
    public function create(): Response
    {
        return Inertia::render('work-orders/create', [
            'campuses'    => $this->campuses(),
            'categories'  => $this->categories(),
            'personnel'   => $this->personnel(),
            'departments' => $this->departments(),
        ]);
    }

    /**
     * Store a newly created work order.
     * Wait time is auto-estimated from category + description.
     * Priority is always computed server-side.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'requestor_name'       => ['required', 'string', 'max:255'],
            'requestor_department' => ['required', 'string', 'max:255'],
            'campus'               => ['required', 'string', 'max:255'],
            'category'             => ['required', 'string', 'max:255'],
            'description'          => ['nullable', 'string'],
            'urgency'              => ['required', 'integer', 'min:1', 'max:6'],
            'assigned_to'          => ['nullable', 'string', 'max:255'],
            'target_completion'    => ['nullable', 'date'],
            'images.*'             => ['nullable', 'image', 'max:2048'],
        ]);

        $waitEstimate = PriorityEngine::estimateWaitTime(
            $validated['category'],
            $validated['description'] ?? '',
        );

        $computed = PriorityEngine::compute(
            (int) $validated['urgency'],
            $validated['requestor_department'],
            $waitEstimate['minutes'],
        );

        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $imagePaths[] = $image->store('work-order-images', 'public');
            }
        }

        WorkOrder::create([
            ...$validated,
            'order_number'           => WorkOrder::generateOrderNumber(),
            'status'                 => 'pending',
            'estimated_wait_minutes' => $waitEstimate['minutes'],
            'impact'                 => $computed['impact'],
            'priority_score'         => $computed['score'],
            'priority'               => $computed['level'],
            'images'                 => $imagePaths ?: null,
        ]);

        return redirect()->route('work-orders.index')
            ->with('success', 'Work order logged successfully.');
    }

    /**
     * Display a specific work order (certificate view).
     */
    public function show(WorkOrder $workOrder): Response
    {
        return Inertia::render('work-orders/show', [
            'workOrder' => $workOrder,
        ]);
    }

    /**
     * Delete a work order.
     */
    public function destroy(WorkOrder $workOrder): RedirectResponse
    {
        $workOrder->delete();

        return redirect()->route('work-orders.index')
            ->with('success', 'Work order deleted.');
    }

    /**
     * Accept a work order — assigns the current user and sets status to in_progress.
     */
    public function accept(WorkOrder $workOrder): RedirectResponse
    {
        $technicianName = auth()->check()
            ? auth()->user()->name
            : (User::orderBy('id', 'desc')->first()?->name ?? 'MIS Staff');

        if ($workOrder->status === 'pending') {
            $workOrder->update([
                'assigned_to' => $technicianName,
                'status'      => 'in_progress',
            ]);
        }

        return redirect()->route('work-orders.show', $workOrder)
            ->with('success', "Work order accepted and assigned to {$technicianName}.");
    }

    /**
     * Update the status of a work order.
     */
    public function updateStatus(Request $request, WorkOrder $workOrder): RedirectResponse
    {
        $validated = $request->validate([
            'status'           => ['required', 'in:pending,in_progress,alternative,contracted,completed,cancelled'],
            'resolution_notes' => ['nullable', 'string'],
        ]);

        $updates = ['status' => $validated['status']];

        if (! empty($validated['resolution_notes'])) {
            $updates['resolution_notes'] = $validated['resolution_notes'];
        }

        if ($validated['status'] === 'completed') {
            $updates['date_completed'] = now();
        }

        $workOrder->update($updates);

        return redirect()->route('work-orders.show', $workOrder)
            ->with('success', 'Work order updated.');
    }

    // ─── Data helpers ─────────────────────────────────────────────────────────

    private function campuses(): array
    {
        return [
            'Las Piñas Campus',
            'Bacoor Campus',
        ];
    }

    private function statuses(): array
    {
        return [
            ['value' => 'pending',     'label' => 'Pending'],
            ['value' => 'in_progress', 'label' => 'In Progress'],
            ['value' => 'alternative', 'label' => 'Alternative'],
            ['value' => 'contracted',  'label' => 'Contracted'],
            ['value' => 'completed',   'label' => 'Completed'],
            ['value' => 'cancelled',   'label' => 'Cancelled'],
        ];
    }

    private function priorities(): array
    {
        return [
            ['value' => 'low',    'label' => 'Low'],
            ['value' => 'medium', 'label' => 'Medium'],
            ['value' => 'high',   'label' => 'High'],
            ['value' => 'urgent', 'label' => 'Urgent'],
        ];
    }

    private function categories(): array
    {
        return [
            'Technical Support',
            'Network Support',
            'Hardware Repair',
            'Software Installation',
            'Electrical',
            'Plumbing',
            'Carpentry',
            'Aircon Maintenance',
            'Other',
        ];
    }

    private function departments(): array
    {
        return [
            'Office of the Student Affairs (OSA)',
            'Finance and Accounting Office (FAO)',
            'Human Resources Department (HRD)',
            'Higher Education Department (HED)',
            'Office of the Registrar (OOR)',
            'MIS Office',
            'Admin',
        ];
    }

    private function personnel(): array
    {
        return [
            'Gerardo F. Vibar Jr.',
            'Kenneth Issac Cabiao Bargo',
            'Joseph San Miguel Apaolaza',
        ];
    }
}
