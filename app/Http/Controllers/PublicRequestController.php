<?php

namespace App\Http\Controllers;

use App\Models\WorkOrder;
use App\Services\PriorityEngine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicRequestController extends Controller
{
    /**
     * Show the public request form (no auth required).
     */
    public function create(): Response
    {
        return Inertia::render('request/create', [
            'campuses'    => $this->campuses(),
            'categories'  => $this->categories(),
            'departments' => $this->departments(),
        ]);
    }

    /**
     * Store the submitted request (no auth required).
     * Wait time is auto-estimated from category + description.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'requestor_name'       => ['required', 'string', 'max:255'],
            'requestor_department' => ['required', 'string', 'max:255'],
            'campus'               => ['required', 'string', 'max:255'],
            'category'             => ['required', 'string', 'max:255'],
            'description'          => ['required', 'string', 'min:10'],
            'urgency'              => ['required', 'integer', 'min:1', 'max:6'],
            'target_completion'    => ['nullable', 'date'],
            'images.*'             => ['nullable', 'image', 'max:2048'],
        ]);

        // Auto-estimate wait time from category + description keywords
        $waitEstimate = PriorityEngine::estimateWaitTime(
            $validated['category'],
            $validated['description'],
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

        $workOrder = WorkOrder::create([
            ...$validated,
            'order_number'           => WorkOrder::generateOrderNumber(),
            'status'                 => 'pending',
            'estimated_wait_minutes' => $waitEstimate['minutes'],
            'impact'                 => $computed['impact'],
            'priority_score'         => $computed['score'],
            'priority'               => $computed['level'],
            'images'                 => $imagePaths ?: null,
        ]);

        return redirect()->route('request.success', ['order' => $workOrder->order_number]);
    }

    /**
     * Show the success / confirmation page.
     */
    public function success(Request $request): Response
    {
        return Inertia::render('request/success', [
            'orderNumber' => $request->query('order'),
        ]);
    }

    // ─── Data helpers ─────────────────────────────────────────────────────────

    private function campuses(): array
    {
        return [
            'Las Piñas Campus',
            'Bacoor Campus',
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
            'Janitorial',
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
}
