import AppLayout from '@/layouts/AppLayout';
import { cn } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkOrder {
    id: number;
    order_number: string;
    requestor_name: string;
    requestor_department: string | null;
    campus: string;
    category: string;
    assigned_to: string | null;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    priority_score: number | null;
    status: 'pending' | 'in_progress' | 'alternative' | 'contracted' | 'completed' | 'cancelled';
    created_at: string;
}

interface Paginated {
    data: WorkOrder[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Filters {
    search?: string;
    campus?: string;
    priority?: string;
    date_from?: string;
    date_to?: string;
    per_page?: string;
    [key: string]: string | undefined;
}

interface Props {
    pendingOrders: Paginated;
    activeOrders: Paginated;
    filters: Filters;
    campuses: string[];
    priorities: { value: string; label: string }[];
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<WorkOrder['priority'], string> = {
    low:    'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high:   'bg-orange-100 text-orange-700',
    urgent: 'bg-red-600 text-white',
};

const STATUS_STYLES: Record<WorkOrder['status'], string> = {
    pending:     'bg-amber-400 text-white',
    in_progress: 'bg-blue-500 text-white',
    alternative: 'bg-orange-400 text-white',
    contracted:  'bg-purple-500 text-white',
    completed:   'bg-teal-500 text-white',
    cancelled:   'bg-gray-400 text-white',
};

const STATUS_LABELS: Record<WorkOrder['status'], string> = {
    pending:     'Pending',
    in_progress: 'In Progress',
    alternative: 'Alternative',
    contracted:  'Contracted',
    completed:   'Completed',
    cancelled:   'Cancelled',
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
        month: '2-digit', day: '2-digit', year: '2-digit',
    });
}

// ─── Table component (reused for both sections) ───────────────────────────────

function OrderTable({
    rows,
    paginated,
    onPageChange,
    onPerPageChange,
    showAccept = false,
    emptyText,
}: {
    rows: WorkOrder[];
    paginated: Paginated;
    onPageChange: (page: number) => void;
    onPerPageChange: (n: string) => void;
    showAccept?: boolean;
    emptyText: string;
}) {
    const { from, to, total, links, current_page, last_page, per_page } = paginated;

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-xs">
                    <thead className="bg-gray-50">
                        <tr>
                            {['ID Number', 'Issued', 'Requestor', 'Campus', 'Category',
                              'Assigned To', 'Priority', 'Status', 'Actions'].map((h) => (
                                <th key={h} className={cn(
                                    'px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-500',
                                    h === 'Actions' && 'text-right',
                                )}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="py-8 text-center text-gray-400 text-xs">
                                    {emptyText}
                                </td>
                            </tr>
                        ) : rows.map((wo, idx) => (
                            <tr key={wo.id} className="hover:bg-gray-50">
                                {/* Queue position for pending */}
                                <td className="px-3 py-2.5">
                                    <div className="flex items-center gap-2">
                                        {showAccept && (
                                            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">
                                                {(current_page - 1) * per_page + idx + 1}
                                            </span>
                                        )}
                                        <span className="font-medium text-gray-800">{wo.order_number}</span>
                                    </div>
                                </td>
                                <td className="px-3 py-2.5 text-gray-600">{formatDate(wo.created_at)}</td>
                                <td className="px-3 py-2.5">
                                    <p className="font-medium text-gray-800">{wo.requestor_name}</p>
                                    {wo.requestor_department && (
                                        <p className="text-[10px] text-gray-400">{wo.requestor_department}</p>
                                    )}
                                </td>
                                <td className="px-3 py-2.5 text-gray-600">{wo.campus}</td>
                                <td className="px-3 py-2.5 text-gray-600">{wo.category}</td>
                                <td className="px-3 py-2.5 text-gray-600">{wo.assigned_to ?? '—'}</td>
                                <td className="px-3 py-2.5">
                                    <div className="flex flex-col gap-0.5">
                                        <span className={cn(
                                            'inline-block w-fit rounded px-2 py-0.5 text-[10px] font-semibold capitalize',
                                            PRIORITY_STYLES[wo.priority],
                                        )}>
                                            {wo.priority === 'urgent' ? 'Critical' : wo.priority}
                                        </span>
                                        {wo.priority_score !== null && (
                                            <span className="text-[9px] text-gray-400">
                                                score: {Number(wo.priority_score).toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-3 py-2.5">
                                    <span className={cn(
                                        'inline-block rounded px-2 py-0.5 text-[10px] font-semibold',
                                        STATUS_STYLES[wo.status],
                                    )}>
                                        {STATUS_LABELS[wo.status]}
                                    </span>
                                </td>
                                <td className="px-3 py-2.5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link href={`/work-orders/${wo.id}`}
                                            className="text-gray-500 hover:text-blue-600">
                                            View
                                        </Link>
                                        {showAccept && (
                                            <button type="button"
                                                className="font-medium text-green-600 hover:text-green-800"
                                                onClick={() => {
                                                    if (confirm('Accept this work order? You will be assigned as the technician.')) {
                                                        router.post(`/work-orders/${wo.id}/accept`);
                                                    }
                                                }}>
                                                Accept
                                            </button>
                                        )}
                                        <button type="button"
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => {
                                                if (confirm('Delete this work order?')) {
                                                    router.delete(`/work-orders/${wo.id}`);
                                                }
                                            }}>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Show</span>
                    <select value={per_page}
                        onChange={(e) => onPerPageChange(e.target.value)}
                        className="rounded border border-gray-200 px-1.5 py-1 text-xs text-gray-700 focus:outline-none">
                        {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <span>Showing {from ?? 0}–{to ?? 0} of {total} entries</span>
                </div>
                <div className="flex items-center gap-1">
                    <PageBtn label="← Prev" disabled={current_page === 1}
                        onClick={() => onPageChange(current_page - 1)} />
                    {links
                        .filter((l) => !l.label.includes('Previous') && !l.label.includes('Next'))
                        .map((l) => (
                            <PageBtn key={l.label} label={l.label} active={l.active}
                                disabled={!l.url}
                                onClick={() => { if (l.url) router.visit(l.url); }} />
                        ))}
                    <PageBtn label="Next →" disabled={current_page === last_page}
                        onClick={() => onPageChange(current_page + 1)} />
                </div>
            </div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function WorkOrdersIndex({
    pendingOrders,
    activeOrders,
    filters,
    campuses,
    priorities,
}: Props) {
    const [search, setSearch]     = useState(filters.search ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo]     = useState(filters.date_to ?? '');
    const [campus, setCampus]     = useState(filters.campus ?? '');
    const [priority, setPriority] = useState(filters.priority ?? '');

    const applyFilters = useCallback((overrides: Partial<Filters> = {}) => {
        router.get('/work-orders', {
            search, date_from: dateFrom, date_to: dateTo, campus, priority, ...overrides,
        }, { preserveState: true, replace: true });
    }, [campus, dateFrom, dateTo, priority, search]);

    return (
        <>
            <Head title="Work Orders" />
            <AppLayout title="Work Order Logs">

                {/* Page header */}
                <div className="mb-5 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Work Orders</h2>
                        <p className="mt-0.5 text-xs text-gray-500">
                            Track, log, and document all technical department work orders.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button type="button"
                            className="flex items-center gap-1.5 rounded bg-[#e63946] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#c1121f]">
                            <PrintIcon className="h-3.5 w-3.5" />
                            Print PDF Report
                        </button>
                        <Link href="/work-orders/create"
                            className="flex items-center gap-1.5 rounded bg-[#1a1a2e] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#16213e]">
                            <PlusIcon className="h-3.5 w-3.5" />
                            Log Work Order
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 relative">
                        <SearchIcon className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search ID, requestor, category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            className="w-full rounded border border-gray-200 py-2 pr-3 pl-8 text-xs text-gray-700 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div>
                            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">Date From</label>
                            <input type="date" value={dateFrom}
                                onChange={(e) => { setDateFrom(e.target.value); applyFilters({ date_from: e.target.value }); }}
                                className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 focus:outline-none" />
                        </div>
                        <div>
                            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">Date To</label>
                            <input type="date" value={dateTo}
                                onChange={(e) => { setDateTo(e.target.value); applyFilters({ date_to: e.target.value }); }}
                                className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 focus:outline-none" />
                        </div>
                        <div>
                            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">Campus</label>
                            <select value={campus}
                                onChange={(e) => { setCampus(e.target.value); applyFilters({ campus: e.target.value }); }}
                                className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 focus:outline-none">
                                <option value="">All Campuses</option>
                                {campuses.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">Priority</label>
                            <select value={priority}
                                onChange={(e) => { setPriority(e.target.value); applyFilters({ priority: e.target.value }); }}
                                className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 focus:outline-none">
                                <option value="">All Priorities</option>
                                {priorities.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* ── Section 1: Pending Queue ───────────────────────────────── */}
                <div className="mb-7">
                    <div className="mb-2 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white">
                                {pendingOrders.total}
                            </span>
                            <h3 className="text-sm font-bold text-gray-800">
                                Unaccepted Work Orders
                            </h3>
                        </div>
                        <span className="text-xs text-gray-400">
                            — sorted by priority score, highest first
                        </span>
                    </div>
                    <p className="mb-3 text-xs text-gray-500">
                        These requests have not been accepted by any staff member yet. Highest-priority items appear first.
                    </p>
                    <OrderTable
                        rows={pendingOrders.data}
                        paginated={pendingOrders}
                        showAccept={true}
                        emptyText="No pending work orders. All caught up!"
                        onPageChange={(page) => applyFilters({ pending_page: String(page) })}
                        onPerPageChange={(n) => applyFilters({ per_page: n })}
                    />
                </div>

                {/* ── Section 2: Active / In-Progress ───────────────────────── */}
                <div className="mb-6">
                    <div className="mb-2 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                                {activeOrders.total}
                            </span>
                            <h3 className="text-sm font-bold text-gray-800">
                                Active Work Orders
                            </h3>
                        </div>
                        <span className="text-xs text-gray-400">
                            — accepted and currently being worked on
                        </span>
                    </div>
                    <p className="mb-3 text-xs text-gray-500">
                        These work orders have been accepted by a technician and are currently in progress, under alternative handling, or contracted out.
                    </p>
                    <OrderTable
                        rows={activeOrders.data}
                        paginated={activeOrders}
                        showAccept={false}
                        emptyText="No active work orders right now."
                        onPageChange={(page) => applyFilters({ active_page: String(page) })}
                        onPerPageChange={(n) => applyFilters({ per_page: n })}
                    />
                </div>

                <p className="mt-4 text-center text-[10px] text-gray-400">
                    System modified by the <strong className="text-gray-500">TEAM MISO</strong>, Saint Francis of Assisi College.
                </p>
            </AppLayout>
        </>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function PageBtn({ label, active = false, disabled = false, onClick }: {
    label: string; active?: boolean; disabled?: boolean; onClick: () => void;
}) {
    return (
        <button type="button" disabled={disabled} onClick={onClick}
            className={cn(
                'min-w-[28px] rounded border px-2 py-1 text-[11px] font-medium transition-colors',
                active ? 'border-[#1a1a2e] bg-[#1a1a2e] text-white'
                       : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
                disabled && 'cursor-not-allowed opacity-40',
            )}>
            {label}
        </button>
    );
}

function SearchIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" /></svg>;
}
function PrintIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a1 1 0 001-1v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4a1 1 0 001 1zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4" /></svg>;
}
function PlusIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
}
