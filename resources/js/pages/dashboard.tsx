import AppLayout from '@/layouts/AppLayout';
import { Head, Link, usePage, usePoll } from '@inertiajs/react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkOrderRow {
    id: number;
    order_number: string;
    requestor_name: string;
    requestor_department: string;
    campus: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status?: string;
    assigned_to?: string | null;
    created_at: string;
}

interface Props {
    stats: {
        total_users: number;
        administrators: number;
        tech_support: number;
    };
    pendingOrders: WorkOrderRow[];
    activeOrders: WorkOrderRow[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dashboard({ stats, pendingOrders, activeOrders }: Props) {
    const { auth } = usePage<{
        auth: { user: { name: string } | null; role: string | null };
    }>().props;

    const firstName = auth?.user?.name?.split(' ')[0] ?? 'Admin';

    // Refresh only the two work-order props every 5 seconds
    usePoll(5000, { only: ['pendingOrders', 'activeOrders'] });

    return (
        <>
            <Head title="Dashboard" />
            <AppLayout title="Dashboard Analytics">

                {/* Welcome banner */}
                <div className="mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-[#c1121f] to-[#8b0000] p-8 text-white shadow-md">
                    <h2 className="mb-2 text-2xl font-bold">
                        Welcome, {firstName}!
                    </h2>
                    <p className="mb-5 max-w-lg text-sm leading-relaxed text-red-100">
                        Welcome to the MISO Work Order System (WOS) for Saint
                        Francis of Assisi College. Log and monitor work orders,
                        generate reports for ongoing tasks, manage ICT tools and
                        equipment through MISO Inventory, and access
                        institutional files through the MISO Repository.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/user-accounts"
                            className="rounded bg-white px-4 py-2 text-xs font-semibold text-[#c1121f] transition-colors hover:bg-red-50"
                        >
                            Manage Accounts
                        </Link>
                        <Link
                            href="/work-orders/create"
                            className="flex items-center gap-1.5 rounded border border-white/60 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                        >
                            <PlusIcon className="h-3.5 w-3.5" />
                            Log Work Order
                        </Link>
                        <Link
                            href="/my-profile"
                            className="rounded border border-white/60 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                        >
                            View Profile
                        </Link>
                    </div>
                </div>

                {/* Stats section */}
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    System Accounts Overview
                </p>
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard
                        label="Total Registered Users"
                        value={stats.total_users}
                        icon={<UsersStatIcon className="h-8 w-8 text-[#e63946]" />}
                    />
                    <StatCard
                        label="Administrators"
                        value={stats.administrators}
                        icon={<ShieldIcon className="h-8 w-8 text-amber-400" />}
                    />
                    <StatCard
                        label="Tech Support Personnel"
                        value={stats.tech_support}
                        icon={<GearIcon className="h-8 w-8 text-teal-400" />}
                    />
                </div>

                {/* Work Orders section */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {/* Pending (unaccepted) */}
                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                Unaccepted Work Orders
                            </p>
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-[#c1121f]">
                                {pendingOrders.length} queued
                            </span>
                        </div>

                        {pendingOrders.length === 0 ? (
                            <EmptyState message="No pending work orders." />
                        ) : (
                            <div className="space-y-2">
                                {pendingOrders.map((order) => (
                                    <WorkOrderCard key={order.id} order={order} />
                                ))}
                            </div>
                        )}

                        {pendingOrders.length >= 10 && (
                            <Link
                                href="/work-orders"
                                className="mt-3 block text-center text-xs text-[#c1121f] hover:underline"
                            >
                                View all pending →
                            </Link>
                        )}
                    </section>

                    {/* Active */}
                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                Active Work Orders
                            </p>
                            <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                                {activeOrders.length} in progress
                            </span>
                        </div>

                        {activeOrders.length === 0 ? (
                            <EmptyState message="No active work orders." />
                        ) : (
                            <div className="space-y-2">
                                {activeOrders.map((order) => (
                                    <WorkOrderCard key={order.id} order={order} showStatus />
                                ))}
                            </div>
                        )}

                        {activeOrders.length >= 10 && (
                            <Link
                                href="/work-orders"
                                className="mt-3 block text-center text-xs text-[#c1121f] hover:underline"
                            >
                                View all active →
                            </Link>
                        )}
                    </section>

                </div>

                {/* Footer */}
                <p className="mt-10 text-center text-[10px] text-gray-400">
                    System credited to the{' '}
                    <strong className="text-gray-500">TEAM MISO</strong>, Saint
                    Francis of Assisi College
                </p>

            </AppLayout>
        </>
    );
}

// ─── Work order card ──────────────────────────────────────────────────────────

function WorkOrderCard({
    order,
    showStatus = false,
}: {
    order: WorkOrderRow;
    showStatus?: boolean;
}) {
    return (
        <Link
            href={`/work-orders/${order.id}`}
            className="block rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-gray-800">
                        {order.order_number}
                    </p>
                    <p className="truncate text-[11px] text-gray-500">
                        {order.requestor_name} · {order.requestor_department}
                    </p>
                    <p className="truncate text-[11px] text-gray-400">
                        {order.category} · {order.campus}
                    </p>
                    {showStatus && order.assigned_to && (
                        <p className="mt-0.5 truncate text-[11px] text-teal-600">
                            Assigned to {order.assigned_to}
                        </p>
                    )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                    <PriorityBadge priority={order.priority} />
                    {showStatus && order.status && (
                        <StatusBadge status={order.status} />
                    )}
                </div>
            </div>
        </Link>
    );
}

// ─── Priority badge ───────────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700',
    high:   'bg-orange-100 text-orange-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low:    'bg-gray-100 text-gray-500',
};

function PriorityBadge({ priority }: { priority: string }) {
    return (
        <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${PRIORITY_STYLES[priority] ?? 'bg-gray-100 text-gray-500'}`}
        >
            {priority}
        </span>
    );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
    in_progress:  'bg-teal-100 text-teal-700',
    alternative:  'bg-purple-100 text-purple-700',
    contracted:   'bg-blue-100 text-blue-700',
};

const STATUS_LABELS: Record<string, string> = {
    in_progress: 'In Progress',
    alternative: 'Alternative',
    contracted:  'Contracted',
};

function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-500'}`}
        >
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 py-8 text-center">
            <p className="text-xs text-gray-400">{message}</p>
        </div>
    );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div>
                <p className="mb-1 text-xs text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
            <div>{icon}</div>
        </div>
    );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
    );
}

function UsersStatIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function ShieldIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    );
}

function GearIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}
