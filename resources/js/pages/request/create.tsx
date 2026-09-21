import {
    IMPACT_LABELS,
    PRIORITY_LABELS,
    URGENCY_OPTIONS,
    computePriority,
    estimateWaitTime,
    impactFromDepartment,
    type Priority,
} from '@/lib/priorityEngine';
import { cn } from '@/lib/utils';
import { Head, useForm } from '@inertiajs/react';
import type { ChangeEvent, DragEvent } from 'react';
import { useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
    campuses: string[];
    categories: string[];
    departments: string[];
}

interface FormData {
    requestor_name: string;
    requestor_department: string;
    campus: string;
    category: string;
    description: string;
    urgency: string;
    target_completion: string;
    images: File[];
    [key: string]: string | File[];
}

// ─── Priority colours ─────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<Priority, { badge: string; bar: string; bg: string }> = {
    critical: { badge: 'bg-red-600 text-white',         bar: 'bg-red-500',    bg: 'bg-red-50 border-red-200' },
    high:     { badge: 'bg-orange-500 text-white',       bar: 'bg-orange-400', bg: 'bg-orange-50 border-orange-200' },
    medium:   { badge: 'bg-yellow-400 text-yellow-900',  bar: 'bg-yellow-400', bg: 'bg-yellow-50 border-yellow-200' },
    low:      { badge: 'bg-blue-500 text-white',          bar: 'bg-blue-400',   bg: 'bg-blue-50 border-blue-200' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PublicRequestForm({ campuses, categories, departments }: Props) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        requestor_name: '',
        requestor_department: '',
        campus: '',
        category: '',
        description: '',
        urgency: '',
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

    // Live score computation
    const urgencyNum = parseInt(data.urgency) || 0;
    const canScore   = urgencyNum >= 1 && data.requestor_department !== '' && waitEstimate !== null;
    const result     = canScore ? computePriority(urgencyNum, data.requestor_department, waitEstimate!.minutes) : null;
    const autoImpact = data.requestor_department ? impactFromDepartment(data.requestor_department) : null;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/request');
    }

    function addFiles(files: FileList | null) {
        if (!files) return;
        const allowed   = Array.from(files).slice(0, 5 - data.images.length);
        const newImages = [...data.images, ...allowed].slice(0, 5);
        setData('images', newImages);
        setPreviewUrls((prev) => [...prev, ...allowed.map((f) => URL.createObjectURL(f))].slice(0, 5));
    }

    function removeImage(i: number) {
        const imgs = [...data.images];
        const urls = [...previewUrls];
        URL.revokeObjectURL(urls[i]);
        imgs.splice(i, 1); urls.splice(i, 1);
        setData('images', imgs);
        setPreviewUrls(urls);
    }

    return (
        <>
            <Head title="Submit a Work Order Request" />
            <div className="min-h-screen bg-gray-100">

                {/* ── Top bar ─────────────────────────────────────── */}
                <header className="bg-[#1a1a2e] px-6 py-4 shadow-md">
                    <div className="mx-auto flex max-w-2xl items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <div className="flex h-8 w-8 items-center justify-center rounded bg-[#e63946] text-xs font-bold text-white">
                                    MISO
                                </div>
                                <span className="text-xs font-bold tracking-widest text-[#e63946]">WOS</span>
                            </div>
                            <div className="h-5 w-px bg-white/20" />
                            <div>
                                <p className="text-sm font-semibold text-white">Work Order Request</p>
                                <p className="text-[10px] text-white/50">Saint Francis of Assisi College</p>
                            </div>
                        </div>
                        <p className="hidden text-[10px] text-white/40 sm:block">
                            Fill out the form below to submit a technical request.
                        </p>
                    </div>
                </header>

                {/* ── Form card ────────────────────────────────────── */}
                <main className="mx-auto max-w-2xl px-4 py-8">
                    <div className="mb-5">
                        <h1 className="text-2xl font-bold text-gray-800">Submit a Work Order Request</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Use this form to report a technical issue or request support from the MIS Office.
                            No login is required.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                    >
                        {/* ── Your Information ─────────────────────── */}
                        <SectionHeader label="Your Information" />
                        <div className="grid grid-cols-2 gap-4 px-6 pt-4 pb-4">
                            <div className="col-span-2 sm:col-span-1">
                                <Label text="Full Name" required />
                                <input
                                    type="text"
                                    value={data.requestor_name}
                                    onChange={(e) => setData('requestor_name', e.target.value)}
                                    placeholder="e.g. Juan dela Cruz"
                                    className={inputCls(!!errors.requestor_name)}
                                />
                                <FieldError msg={errors.requestor_name} />
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <Label text="Department / Office" required />
                                <select
                                    value={data.requestor_department}
                                    onChange={(e) => setData('requestor_department', e.target.value)}
                                    className={selectCls(!!errors.requestor_department)}
                                >
                                    <option value="">Select your department</option>
                                    {departments.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                <FieldError msg={errors.requestor_department} />
                                {autoImpact !== null && (
                                    <p className="mt-1 flex items-center gap-1 text-[10px] text-gray-500">
                                        <SparkleIcon className="h-3 w-3 text-amber-400" />
                                        Impact auto-set to{' '}
                                        <strong className="text-gray-700">
                                            {autoImpact} — {IMPACT_LABELS[autoImpact]}
                                        </strong>
                                    </p>
                                )}
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <Label text="Campus" required />
                                <select
                                    value={data.campus}
                                    onChange={(e) => setData('campus', e.target.value)}
                                    className={selectCls(!!errors.campus)}
                                >
                                    <option value="">Select campus</option>
                                    {campuses.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <FieldError msg={errors.campus} />
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <Label text="Service Category" required />
                                <select
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className={selectCls(!!errors.category)}
                                >
                                    <option value="">Select category</option>
                                    {categories.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <FieldError msg={errors.category} />
                            </div>
                        </div>

                        {/* ── Request Details ───────────────────────── */}
                        <SectionHeader label="Request Details" />
                        <div className="px-6 pt-4 pb-4">
                            <Label text="Describe the Issue" required />
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={5}
                                placeholder="Please describe the problem or what support you need in detail..."
                                className={`${inputCls(!!errors.description)} resize-y`}
                            />
                            <FieldError msg={errors.description} />
                        </div>

                        {/* ── Priority Information ──────────────────── */}
                        <SectionHeader label="Priority Information" />
                        <div className="px-6 pt-4 pb-2">
                            <div className="max-w-sm">
                                <Label text="How urgent is this?" required />
                                <select
                                    value={data.urgency}
                                    onChange={(e) => setData('urgency', e.target.value)}
                                    className={selectCls(!!errors.urgency)}
                                >
                                    <option value="">Select urgency level</option>
                                    {URGENCY_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                                <FieldError msg={errors.urgency} />
                            </div>

                            {/* Auto wait-time estimate */}
                            {waitEstimate && (
                                <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5">
                                    <p className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                                        <ClockIcon className="h-3.5 w-3.5" />
                                        Estimated resolution time:{' '}
                                        <strong>{waitEstimate.minutes} minutes</strong>
                                        <span className="font-normal text-blue-500">
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
                                                <li key={r} className="list-disc text-[10px] text-blue-500">{r}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            {/* Live score panel */}
                            {result ? (
                                <div className={cn(
                                    'mt-4 rounded-lg border p-4',
                                    LEVEL_COLORS[result.level].bg,
                                )}>
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                                            <SparkleIcon className="h-3.5 w-3.5 text-amber-400" />
                                            Your request will be assigned:
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-lg font-bold text-gray-800">
                                                {result.scoreDisplay}
                                            </span>
                                            <span className={cn(
                                                'rounded px-2.5 py-0.5 text-xs font-bold uppercase',
                                                LEVEL_COLORS[result.level].badge,
                                            )}>
                                                {result.levelLabel} Priority
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <ScoreRow label="Urgency"         score={result.urgency}   max={5} level={result.level} />
                                        <ScoreRow label="Impact (dept.)"  score={result.impact}    max={5} level={result.level} />
                                        <ScoreRow label="Wait Time Score" score={result.waitScore} max={5} level={result.level} />
                                    </div>

                                    <p className="mt-2.5 text-[11px] font-mono text-gray-500">
                                        ({result.urgency} + {result.impact} + {result.waitScore}) / 3 = <strong className="text-gray-800">{result.scoreDisplay}</strong>
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-4 text-center text-xs text-gray-400">
                                    Fill in department, urgency, and estimated time to see your priority score.
                                </div>
                            )}
                        </div>

                        {/* ── Additional Info ───────────────────────── */}
                        <SectionHeader label="Additional Information" />
                        <div className="px-6 pt-4 pb-4">
                            <Label text="Preferred Completion Date (optional)" />
                            <input
                                type="date"
                                value={data.target_completion}
                                onChange={(e) => setData('target_completion', e.target.value)}
                                className={inputCls(!!errors.target_completion)}
                            />
                            <FieldError msg={errors.target_completion} />
                        </div>

                        {/* ── Attachments ───────────────────────────── */}
                        <SectionHeader label="Attachments (optional)" />
                        <div className="px-6 pt-4 pb-6">
                            <p className="mb-2 text-xs text-gray-500">
                                Upload photos of the issue to help us respond faster. Max 5 images.
                            </p>
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={(e: DragEvent<HTMLDivElement>) => {
                                    e.preventDefault();
                                    setDragOver(false);
                                    addFiles(e.dataTransfer.files);
                                }}
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors',
                                    dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300',
                                )}
                            >
                                <UploadIcon className="mb-2 h-8 w-8 text-gray-300" />
                                <p className="text-xs text-gray-500">
                                    <span className="font-semibold text-blue-500">Click to upload</span> or drag and drop
                                </p>
                                <p className="mt-0.5 text-[10px] text-gray-400">PNG, JPG, JPEG up to 2MB each</p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e: ChangeEvent<HTMLInputElement>) => addFiles(e.target.files)}
                            />

                            {previewUrls.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {previewUrls.map((url, i) => (
                                        <div key={url} className="relative h-16 w-16 overflow-hidden rounded border border-gray-200">
                                            <img src={url} alt={`preview-${i}`} className="h-full w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                                                className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white"
                                            >×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── Submit ────────────────────────────────── */}
                        <div className="border-t border-gray-100 bg-gray-50 px-6 py-5">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-lg bg-[#e63946] py-3 text-sm font-bold text-white shadow transition-colors hover:bg-[#c1121f] disabled:opacity-60"
                            >
                                {processing ? 'Submitting…' : 'Submit Work Order Request'}
                            </button>
                            <p className="mt-3 text-center text-[10px] text-gray-400">
                                Your request will be reviewed by the MIS Office and assigned accordingly.
                            </p>
                        </div>
                    </form>

                    <p className="mt-6 text-center text-[10px] text-gray-400">
                        System developed by <strong className="text-gray-500">TEAM MISO</strong> · Saint Francis of Assisi College
                    </p>
                </main>
            </div>
        </>
    );
}

// ─── Score row ────────────────────────────────────────────────────────────────

function ScoreRow({ label, score, max, level }: {
    label: string; score: number; max: number; level: Priority;
}) {
    const pct = Math.round((score / max) * 100);
    return (
        <div className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-[11px] text-gray-600">{label}</span>
            <div className="flex-1 overflow-hidden rounded-full bg-black/10" style={{ height: 6 }}>
                <div
                    className={cn('h-full rounded-full transition-all duration-500', LEVEL_COLORS[level].bar)}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="w-8 text-right text-[11px] font-bold text-gray-700">{score}/{max}</span>
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
    return (
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-2.5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#e63946]">{label}</h3>
        </div>
    );
}

function Label({ text, required }: { text: string; required?: boolean }) {
    return (
        <label className="mb-1 block text-sm font-medium text-gray-700">
            {text}{required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
    );
}

function FieldError({ msg }: { msg?: string }) {
    if (!msg) return null;
    return <p className="mt-0.5 text-xs text-red-500">{msg}</p>;
}

function inputCls(error: boolean) {
    return cn(
        'w-full rounded-lg border px-3 py-2.5 text-sm text-gray-700 focus:ring-2 focus:outline-none',
        error ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
              : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100',
    );
}

function selectCls(error: boolean) {
    return cn(inputCls(error), 'bg-white appearance-none');
}

function UploadIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
    );
}

function SparkleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
        </svg>
    );
}

function ClockIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" d="M12 6v6l4 2" />
        </svg>
    );
}
