import AppLayout from '@/layouts/AppLayout';
import {
    IMPACT_LABELS,
    URGENCY_OPTIONS,
    WAIT_TIME_BANDS,
    computePriority,
    estimateWaitTime,
    impactFromDepartment,
    type Priority,
} from '@/lib/priorityEngine';
import { cn } from '@/lib/utils';
import { Head, Link, useForm } from '@inertiajs/react';
import type { ChangeEvent, DragEvent } from 'react';
import { useRef, useState } from 'react';

interface Props {
    campuses: string[];
    categories: string[];
    personnel: string[];
    departments: string[];
}

interface FormData {
    requestor_name: string;
    requestor_department: string;
    campus: string;
    category: string;
    description: string;
    urgency: string;
    assigned_to: string;
    target_completion: string;
    images: File[];
    [key: string]: string | File[];
}

const LEVEL_COLORS: Record<Priority, { badge: string; bar: string; ring: string }> = {
    critical: { badge: 'bg-red-600 text-white',          bar: 'bg-red-500',    ring: 'ring-red-200' },
    high:     { badge: 'bg-orange-500 text-white',        bar: 'bg-orange-400', ring: 'ring-orange-200' },
    medium:   { badge: 'bg-yellow-400 text-yellow-900',   bar: 'bg-yellow-400', ring: 'ring-yellow-200' },
    low:      { badge: 'bg-blue-500 text-white',           bar: 'bg-blue-400',   ring: 'ring-blue-200' },
};

export default function CreateWorkOrder({ campuses, categories, personnel, departments }: Props) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        requestor_name: '',
        requestor_department: '',
        campus: '',
        category: '',
        description: '',
        urgency: '',
        assigned_to: '',
        target_completion: '',
        images: [],
    });

    const [dragOver, setDragOver]       = useState(false);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const fileInputRef                  = useRef<HTMLInputElement>(null);

    // Auto-estimate wait from category + description
    const waitEstimate = data.category
        ? estimateWaitTime(data.category, data.description)
        : null;

    // Derived values for score panel
    const urgencyNum = parseInt(data.urgency) || 0;
    const canScore   = urgencyNum >= 1 && data.requestor_department !== '' && waitEstimate !== null;
    const result     = canScore
        ? computePriority(urgencyNum, data.requestor_department, waitEstimate!.minutes)
        : null;
    const autoImpact = data.requestor_department ? impactFromDepartment(data.requestor_department) : null;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/work-orders');
    }

    function addFiles(files: FileList | null) {
        if (!files) return;
        const allowed   = Array.from(files).slice(0, 5 - data.images.length);
        const newImages = [...data.images, ...allowed].slice(0, 5);
        setData('images', newImages);
        setPreviewUrls((prev) => [...prev, ...allowed.map((f) => URL.createObjectURL(f))].slice(0, 5));
    }

    function removeImage(i: number) {
        const imgs = [...data.images]; const urls = [...previewUrls];
        URL.revokeObjectURL(urls[i]); imgs.splice(i, 1); urls.splice(i, 1);
        setData('images', imgs); setPreviewUrls(urls);
    }

    return (
        <>
            <Head title="New Work Order Log" />
            <AppLayout title="New Work Order Log">
                <Link href="/work-orders" className="mb-4 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                    <ChevronLeftIcon className="h-3.5 w-3.5" /> Back to Log List
                </Link>

                <div className="mx-auto max-w-2xl">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Log New Work Order</h2>
                        <p className="text-xs text-gray-500">Record work request details, priority, status, and department assignments.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">

                        {/* ── Request Details ───────────────────────── */}
                        <SectionHeader label="Request Details" />
                        <div className="grid grid-cols-2 gap-4 px-6 pt-4 pb-4">
                            <div>
                                <Label text="Requestor Name" required />
                                <input type="text" value={data.requestor_name}
                                    onChange={(e) => setData('requestor_name', e.target.value)}
                                    className={inputCls(!!errors.requestor_name)} />
                                <FieldError msg={errors.requestor_name} />
                            </div>

                            <div>
                                <Label text="Service Category" required />
                                <select value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className={selectCls(!!errors.category)}>
                                    <option value="">Select Category</option>
                                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <FieldError msg={errors.category} />
                            </div>

                            <div>
                                <Label text="Department" required />
                                <select value={data.requestor_department}
                                    onChange={(e) => setData('requestor_department', e.target.value)}
                                    className={selectCls(!!errors.requestor_department)}>
                                    <option value="">Select Department</option>
                                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <FieldError msg={errors.requestor_department} />
                                {autoImpact !== null && (
                                    <p className="mt-1 flex items-center gap-1 text-[10px] text-gray-500">
                                        <SparkleIcon className="h-3 w-3 text-amber-400" />
                                        Auto-impact: <strong className="text-gray-700">{autoImpact} — {IMPACT_LABELS[autoImpact]}</strong>
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label text="Campus" required />
                                <select value={data.campus}
                                    onChange={(e) => setData('campus', e.target.value)}
                                    className={selectCls(!!errors.campus)}>
                                    <option value="">Select Campus</option>
                                    {campuses.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <FieldError msg={errors.campus} />
                            </div>
                        </div>

                        {/* ── Description & Scope ───────────────────── */}
                        <SectionHeader label="Description & Scope" />
                        <div className="px-6 pt-4 pb-4">
                            <Label text="Request Description" />
                            <textarea value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                placeholder="Describe details of the technical problem or support work requested..."
                                className={`${inputCls(!!errors.description)} resize-y`} />
                            <FieldError msg={errors.description} />

                            {/* Wait-time estimate */}
                            {waitEstimate && (
                                <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                                    <p className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500">
                                        <ClockIcon className="h-3 w-3 text-blue-400" />
                                        Auto-estimated wait:{' '}
                                        <strong className="text-gray-800">{waitEstimate.minutes} minutes</strong>
                                        <span className="text-gray-400">
                                            (base {waitEstimate.baseline} min
                                            {waitEstimate.adjustment !== 0 && (
                                                <span className={waitEstimate.adjustment > 0 ? 'text-orange-500' : 'text-green-600'}>
                                                    {' '}{waitEstimate.adjustment > 0 ? '+' : ''}{waitEstimate.adjustment}
                                                </span>
                                            )})
                                        </span>
                                    </p>
                                    {waitEstimate.matchedReasons.length > 0 && (
                                        <ul className="mt-1 space-y-0.5 pl-5">
                                            {waitEstimate.matchedReasons.map((r) => (
                                                <li key={r} className="list-disc text-[10px] text-gray-400">{r}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── Priority Scoring ──────────────────────── */}
                        <SectionHeader label="Priority Scoring" />
                        <div className="px-6 pt-4 pb-4">
                            <div className="max-w-xs">
                                <Label text="Urgency" required />
                                <select value={data.urgency}
                                    onChange={(e) => setData('urgency', e.target.value)}
                                    className={selectCls(!!errors.urgency)}>
                                    <option value="">Select Urgency Level</option>
                                    {URGENCY_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.value} — {o.label}</option>
                                    ))}
                                </select>
                                <FieldError msg={errors.urgency} />
                            </div>

                            {/* Live score panel */}
                            {result ? (
                                <div className={cn('mt-4 rounded-lg border p-4 ring-2 border-gray-100 bg-gray-50', LEVEL_COLORS[result.level].ring)}>
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                            <SparkleIcon className="h-3 w-3 text-amber-400" />
                                            Computed Priority
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-gray-800">{result.scoreDisplay}</span>
                                            <span className={cn('rounded px-2.5 py-0.5 text-xs font-bold uppercase', LEVEL_COLORS[result.level].badge)}>
                                                {result.levelLabel}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <ScoreRow label="Urgency"         sublabel={URGENCY_OPTIONS.find(o => o.value === result.urgency)?.label ?? ''} score={result.urgency}   max={5} level={result.level} />
                                        <ScoreRow label="Impact"          sublabel={`${result.impactLabel} — auto from department`}                      score={result.impact}    max={5} level={result.level} />
                                        <ScoreRow label="Wait Time Score" sublabel={`${result.estimatedMinutes} min → ${WAIT_TIME_BANDS.find(b => result.estimatedMinutes <= b.max)?.label}`} score={result.waitScore} max={5} level={result.level} />
                                    </div>
                                    <div className="mt-3 rounded border border-gray-200 bg-white px-3 py-2 font-mono text-[11px] text-gray-500">
                                        ({result.urgency} + {result.impact} + {result.waitScore}) / 3 = <strong className="text-gray-800">{result.scoreDisplay}</strong>
                                        <span className="ml-2">→</span>
                                        <span className={cn('ml-2 font-bold uppercase',
                                            result.level === 'critical' ? 'text-red-600'
                                            : result.level === 'high'   ? 'text-orange-600'
                                            : result.level === 'medium' ? 'text-yellow-600'
                                            : 'text-blue-600')}>
                                            {result.levelLabel}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-[10px] text-gray-400">Priority and wait time are auto-computed and cannot be overridden.</p>
                                </div>
                            ) : (
                                <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center text-xs text-gray-400">
                                    Select category, department, and urgency to compute priority.
                                </div>
                            )}
                        </div>

                        {/* ── Tracking & Metrics ────────────────────── */}
                        <SectionHeader label="Tracking & Metrics" />
                        <div className="grid grid-cols-2 gap-4 px-6 pt-4 pb-2">
                            <div>
                                <Label text="Status" />
                                <input type="text" readOnly value="Pending (Auto-assigned on creation)"
                                    className="w-full cursor-not-allowed rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-400" />
                            </div>
                            <div>
                                <Label text="Target Completion" />
                                <input type="date" value={data.target_completion}
                                    onChange={(e) => setData('target_completion', e.target.value)}
                                    className={inputCls(!!errors.target_completion)} />
                                <FieldError msg={errors.target_completion} />
                            </div>
                        </div>

                        <div className="px-6 pb-6 pt-4">
                            <Label text="Assigned MISO Personnel" />
                            <select value={data.assigned_to}
                                onChange={(e) => setData('assigned_to', e.target.value)}
                                className={selectCls(!!errors.assigned_to)}>
                                <option value="">Select MISO Personnel</option>
                                {personnel.map((p) => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <FieldError msg={errors.assigned_to} />
                        </div>

                        {/* ── Image Attachments ─────────────────────── */}
                        <SectionHeader label="Image Attachments" />
                        <div className="px-6 pt-4 pb-6">
                            <Label text="Upload Images (Max: 5 only)" />
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                                onClick={() => fileInputRef.current?.click()}
                                className={cn('mt-1 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors',
                                    dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300')}>
                                <UploadIcon className="mb-2 h-8 w-8 text-gray-300" />
                                <p className="text-xs text-gray-500"><span className="font-semibold text-blue-500">Upload a file</span> or drag and drop</p>
                                <p className="mt-0.5 text-[10px] text-gray-400">PNG, JPG, JPEG, GIF, WEBP up to 2MB each</p>
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                                onChange={(e: ChangeEvent<HTMLInputElement>) => addFiles(e.target.files)} />

                            {previewUrls.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {previewUrls.map((url, i) => (
                                        <div key={url} className="relative h-16 w-16 overflow-hidden rounded border border-gray-200">
                                            <img src={url} alt={`preview-${i}`} className="h-full w-full object-cover" />
                                            <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                                                className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white">×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── Footer ───────────────────────────────── */}
                        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
                            <Link href="/work-orders" className="rounded border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">Cancel</Link>
                            <button type="submit" disabled={processing}
                                className="rounded bg-[#1a1a2e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#16213e] disabled:opacity-60">
                                {processing ? 'Logging…' : 'Log Into Order'}
                            </button>
                        </div>
                    </form>
                </div>
            </AppLayout>
        </>
    );
}

// ─── Score row ────────────────────────────────────────────────────────────────

function ScoreRow({ label, sublabel, score, max, level }: {
    label: string; sublabel: string; score: number; max: number; level: Priority;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-28 shrink-0">
                <p className="text-[10px] font-semibold text-gray-600">{label}</p>
                <p className="truncate text-[9px] text-gray-400">{sublabel}</p>
            </div>
            <div className="flex-1 overflow-hidden rounded-full bg-gray-200" style={{ height: 7 }}>
                <div className={cn('h-full rounded-full transition-all duration-500', LEVEL_COLORS[level].bar)}
                    style={{ width: `${Math.round((score / max) * 100)}%` }} />
            </div>
            <span className="w-8 text-right text-[11px] font-bold text-gray-700">{score}/{max}</span>
        </div>
    );
}

function SectionHeader({ label }: { label: string }) {
    return (
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#e63946]">{label}</h3>
        </div>
    );
}

function Label({ text, required }: { text: string; required?: boolean }) {
    return (
        <label className="mb-1 block text-xs font-medium text-gray-700">
            {text}{required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
    );
}

function FieldError({ msg }: { msg?: string }) {
    if (!msg) return null;
    return <p className="mt-0.5 text-[10px] text-red-500">{msg}</p>;
}

function inputCls(error: boolean) {
    return cn('w-full rounded border px-3 py-2 text-xs text-gray-700 focus:ring-1 focus:outline-none',
        error ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
              : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100');
}
function selectCls(error: boolean) { return cn(inputCls(error), 'bg-white appearance-none'); }

function ChevronLeftIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
}
function UploadIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
}
function SparkleIcon({ className }: { className?: string }) {
    return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>;
}
function ClockIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2" /></svg>;
}
