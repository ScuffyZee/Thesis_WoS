import AppLayout from '@/layouts/AppLayout';
import { cn } from '@/lib/utils';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkOrder {
    id: number;
    order_number: string;
    requestor_name: string;
    requestor_department: string | null;
    campus: string;
    category: string;
    description: string | null;
    resolution_notes: string | null;
    urgency: number | null;
    impact: number | null;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    priority_score: number | null;
    status: 'pending' | 'in_progress' | 'alternative' | 'contracted' | 'completed' | 'cancelled';
    assigned_to: string | null;
    target_completion: string | null;
    date_completed: string | null;
    estimated_wait_minutes: number | null;
    images: string[] | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    workOrder: WorkOrder;
}

// ─── Colour maps ──────────────────────────────────────────────────────────────

const PRIORITY_STYLES = {
    low:    'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high:   'bg-orange-100 text-orange-700',
    urgent: 'bg-red-600 text-white',
};

const PRIORITY_LABELS = {
    low: 'Low', medium: 'Medium', high: 'High', urgent: 'Critical',
};

const STATUS_STYLES = {
    pending:     'bg-amber-400 text-white',
    in_progress: 'bg-blue-500 text-white',
    alternative: 'bg-orange-400 text-white',
    contracted:  'bg-purple-500 text-white',
    completed:   'bg-green-500 text-white',
    cancelled:   'bg-gray-400 text-white',
};

const STATUS_LABELS = {
    pending: 'Pending', in_progress: 'In Progress', alternative: 'Alternative',
    contracted: 'Contracted', completed: 'Completed', cancelled: 'Cancelled',
};

const STATUSES = [
    { value: 'pending',     label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'alternative', label: 'Alternative' },
    { value: 'contracted',  label: 'Contracted' },
    { value: 'completed',   label: 'Completed' },
    { value: 'cancelled',   label: 'Cancelled' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso: string | null | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
    });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WorkOrderShow({ workOrder: wo }: Props) {
    const { auth, flash } = usePage<{
        auth: { user: { name: string } | null };
        flash: { success: string | null };
    }>().props;

    const [showStatusForm, setShowStatusForm] = useState(false);
    const [lightbox, setLightbox]             = useState<string | null>(null);

    const statusForm = useForm({
        status:           wo.status,
        resolution_notes: wo.resolution_notes ?? '',
    });

    const isAccepted = wo.status !== 'pending';
    const currentUser = auth?.user?.name ?? 'MIS Staff';

    function handleAccept() {
        if (!confirm('Accept this work order? You will be assigned as the technician.')) return;
        router.post(`/work-orders/${wo.id}/accept`);
    }

    function handleMarkComplete() {
        if (!confirm('Mark this work order as completed?')) return;
        router.patch(`/work-orders/${wo.id}/status`, {
            status: 'completed',
            resolution_notes: wo.resolution_notes ?? '',
        });
    }

    function handleStatusSubmit(e: React.FormEvent) {
        e.preventDefault();
        statusForm.patch(`/work-orders/${wo.id}/status`, {
            onSuccess: () => setShowStatusForm(false),
        });
    }

    return (
        <>
            <Head title={`Work Order — ${wo.order_number}`} />
            <AppLayout title="Work Order Summary">

                {/* Flash */}
                {flash?.success && (
                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                {/* Top action bar */}
                <div className="mb-5 flex items-center justify-between">
                    <Link href="/work-orders"
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                        <ChevronLeftIcon className="h-3.5 w-3.5" />
                        Back to Log List
                    </Link>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                        >
                            <PrintIcon className="h-3.5 w-3.5" />
                            Print / Save PDF
                        </button>

                        {/* Accept button — only shown when still pending */}
                        {!isAccepted && (
                            <button
                                type="button"
                                onClick={handleAccept}
                                className="flex items-center gap-1.5 rounded bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                            >
                                <CheckIcon className="h-3.5 w-3.5" />
                                Accept Work Order
                            </button>
                        )}

                        {/* Mark as Complete — shown when in progress */}
                        {wo.status !== 'completed' && wo.status !== 'cancelled' && isAccepted && (
                            <button
                                type="button"
                                onClick={handleMarkComplete}
                                className="flex items-center gap-1.5 rounded bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700"
                            >
                                <CheckCircleIcon className="h-3.5 w-3.5" />
                                Mark as Complete
                            </button>
                        )}

                        {/* Edit details */}
                        <button
                            type="button"
                            onClick={() => setShowStatusForm((v) => !v)}
                            className="flex items-center gap-1.5 rounded bg-[#e63946] px-3 py-2 text-xs font-semibold text-white hover:bg-[#c1121f]"
                        >
                            <EditIcon className="h-3.5 w-3.5" />
                            Edit Details
                        </button>
                    </div>
                </div>

                {/* ── Status / resolution edit panel ────────────── */}
                {showStatusForm && (
                    <form onSubmit={handleStatusSubmit}
                        className="mb-5 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 bg-gray-50 px-5 py-2.5">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#e63946]">Update Work Order</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 p-5">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">Status</label>
                                <select
                                    value={statusForm.data.status}
                                    onChange={(e) => statusForm.setData('status', e.target.value)}
                                    className="w-full appearance-none rounded border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                >
                                    {STATUSES.map((s) => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1 block text-xs font-medium text-gray-700">Resolution Notes</label>
                                <textarea
                                    value={statusForm.data.resolution_notes}
                                    onChange={(e) => statusForm.setData('resolution_notes', e.target.value)}
                                    rows={3}
                                    placeholder="Describe what was done to resolve the issue..."
                                    className="w-full resize-y rounded border border-gray-200 px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
                            <button type="button" onClick={() => setShowStatusForm(false)}
                                className="rounded border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" disabled={statusForm.processing}
                                className="rounded bg-[#1a1a2e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#16213e] disabled:opacity-60">
                                {statusForm.processing ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}

                {/* ── Certificate card ───────────────────────────── */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm print:shadow-none">

                    {/* Certificate header */}
                    <div className="flex items-start justify-between border-b border-gray-100 px-8 py-5">
                        {/* School logo + name */}
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#e63946] bg-white">
                                <span className="text-[10px] font-bold leading-tight text-center text-[#e63946]">SFAC</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wide text-gray-800">Saint Francis of Assisi College</p>
                                <p className="text-[10px] uppercase tracking-widest text-gray-500">Management Information System Office</p>
                                <p className="text-[10px] uppercase tracking-widest text-gray-400">MISO Work Order System</p>
                            </div>
                        </div>

                        {/* Document class */}
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest text-gray-400">Document Class</p>
                            <p className="text-xs font-bold uppercase text-[#e63946]">AI Report Certificate</p>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="border-b border-gray-100 py-4 text-center">
                        <h2 className="text-base font-bold uppercase tracking-widest text-gray-800">
                            Work Order Certificate
                        </h2>
                        <p className="mt-0.5 text-[11px] text-gray-500">
                            Job Order Serial: <strong>{wo.order_number}</strong>
                        </p>
                    </div>

                    {/* Meta grid */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 px-8 py-6">
                        <MetaRow label="Date Issued"         value={fmt(wo.created_at)} />
                        <MetaRow label="Assigned Technician" value={wo.assigned_to ?? '—'} />
                        <MetaRow label="Requestor"           value={wo.requestor_name} />
                        <MetaRow label="Priority Level">
                            <span className={cn('rounded px-2 py-0.5 text-[10px] font-bold uppercase', PRIORITY_STYLES[wo.priority])}>
                                {PRIORITY_LABELS[wo.priority]}
                            </span>
                            {wo.priority_score !== null && (
                                <span className="ml-1.5 text-[10px] text-gray-400">
                                    (score: {Number(wo.priority_score).toFixed(2)})
                                </span>
                            )}
                        </MetaRow>
                        <MetaRow label="Department"   value={wo.requestor_department ?? '—'} />
                        <MetaRow label="Current Status">
                            <span className={cn('rounded px-2 py-0.5 text-[10px] font-bold uppercase', STATUS_STYLES[wo.status])}>
                                {STATUS_LABELS[wo.status]}
                            </span>
                        </MetaRow>
                        <MetaRow label="Campus"       value={wo.campus} />
                        <MetaRow label="Date Completed" value={fmt(wo.date_completed)} />
                        <MetaRow label="Service Category" value={wo.category} />
                        {wo.target_completion && (
                            <MetaRow label="Target Completion" value={fmt(wo.target_completion)} />
                        )}
                    </div>

                    {/* Score breakdown (if scored) */}
                    {wo.priority_score !== null && (
                        <div className="border-t border-gray-100 px-8 py-4">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Priority Score Breakdown</p>
                            <div className="flex flex-wrap gap-6">
                                <ScorePill label="Urgency" value={wo.urgency} max={6} />
                                <ScorePill label="Impact"  value={wo.impact}  max={5} />
                                <ScorePill label="Est. Wait" value={wo.estimated_wait_minutes ? `${wo.estimated_wait_minutes} min` : null} />
                                <ScorePill label="Final Score" value={Number(wo.priority_score).toFixed(2)} highlight />
                            </div>
                        </div>
                    )}

                    {/* Problem description */}
                    <div className="border-t border-gray-100 px-8 py-5">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#e63946]">
                            Problem &amp; Scope Description
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {wo.description ?? <span className="text-gray-400 italic">No description provided.</span>}
                        </p>
                    </div>

                    {/* Resolution details */}
                    <div className="border-t border-gray-100 px-8 py-5">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#e63946]">
                            Resolution Details
                        </p>
                        {wo.resolution_notes ? (
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {wo.resolution_notes}
                            </p>
                        ) : (
                            <p className="text-sm italic text-gray-400">
                                No resolution notes yet.{' '}
                                {!isAccepted && (
                                    <button
                                        type="button"
                                        onClick={handleAccept}
                                        className="text-green-600 underline hover:text-green-800"
                                    >
                                        Accept this work order
                                    </button>
                                )}{' '}
                                {isAccepted && wo.status !== 'completed' && (
                                    <button
                                        type="button"
                                        onClick={() => setShowStatusForm(true)}
                                        className="text-blue-500 underline hover:text-blue-700"
                                    >
                                        Add resolution notes
                                    </button>
                                )}
                            </p>
                        )}
                    </div>

                    {/* Attached images */}
                    {wo.images && wo.images.length > 0 && (
                        <div className="border-t border-gray-100 px-8 py-5">
                            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#e63946]">
                                Attached Images ({wo.images.length})
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {wo.images.map((path, i) => (
                                    <button
                                        key={path}
                                        type="button"
                                        onClick={() => setLightbox(`/storage/${path}`)}
                                        className="h-24 w-24 overflow-hidden rounded-lg border border-gray-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    >
                                        <img
                                            src={`/storage/${path}`}
                                            alt={`attachment-${i + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certificate footer / signature area */}
                    <div className="border-t border-gray-100 px-8 py-6 print:mt-8">
                        <div className="flex justify-between">
                            <SignatureLine label="Prepared by" name={wo.assigned_to ?? '___________________'} />
                            <SignatureLine label="Noted by" name="MIS Head" />
                            <SignatureLine label="Received by" name={wo.requestor_name} />
                        </div>
                    </div>
                </div>

                {/* Lightbox */}
                {lightbox && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                        onClick={() => setLightbox(null)}
                    >
                        <img
                            src={lightbox}
                            alt="attachment"
                            className="max-h-[90vh] max-w-full rounded-lg shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            type="button"
                            onClick={() => setLightbox(null)}
                            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                        >×</button>
                    </div>
                )}
            </AppLayout>
        </>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetaRow({
    label,
    value,
    children,
}: {
    label: string;
    value?: string | null;
    children?: React.ReactNode;
}) {
    return (
        <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
            <div className="mt-0.5 text-sm font-medium text-gray-800">
                {children ?? value ?? '—'}
            </div>
        </div>
    );
}

function ScorePill({
    label,
    value,
    max,
    highlight = false,
}: {
    label: string;
    value?: number | string | null;
    max?: number;
    highlight?: boolean;
}) {
    return (
        <div className={cn('rounded-lg border px-3 py-2 text-center', highlight ? 'border-[#e63946] bg-red-50' : 'border-gray-100 bg-gray-50')}>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
            <p className={cn('mt-0.5 font-bold', highlight ? 'text-[#e63946]' : 'text-gray-700')}>
                {value ?? '—'}{max ? <span className="text-[10px] font-normal text-gray-400">/{max}</span> : null}
            </p>
        </div>
    );
}

function SignatureLine({ label, name }: { label: string; name: string }) {
    return (
        <div className="text-center">
            <div className="mx-auto mb-1 w-36 border-b border-gray-400" style={{ height: 32 }} />
            <p className="text-xs font-semibold text-gray-700">{name}</p>
            <p className="text-[10px] text-gray-400">{label}</p>
        </div>
    );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronLeftIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
}
function PrintIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a1 1 0 001-1v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4a1 1 0 001 1zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4" /></svg>;
}
function CheckIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
}
function EditIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
}
function CheckCircleIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
