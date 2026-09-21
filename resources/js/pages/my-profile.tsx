import AppLayout from '@/layouts/AppLayout';
import { cn } from '@/lib/utils';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserData {
    id: number;
    name: string;
    username: string;
    email: string;
    phone: string | null;
    role: string;
    avatar: string | null;
    signature: string | null;
}

interface Props {
    user: UserData;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function splitName(full: string) {
    const parts = full.trim().split(/\s+/);
    if (parts.length === 1) return { first: parts[0], middle: '', last: '' };
    if (parts.length === 2) return { first: parts[0], middle: '', last: parts[1] };
    return {
        first:  parts[0],
        middle: parts.slice(1, -1).join(' '),
        last:   parts[parts.length - 1],
    };
}

function joinName(first: string, middle: string, last: string) {
    return [first, middle, last].filter(Boolean).join(' ');
}

function initials(name: string) {
    return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

const AVATAR_BG = 'bg-[#e63946]';

// ─── Signature Pad ────────────────────────────────────────────────────────────

function SignaturePad({
    value,
    onChange,
}: {
    value: string;
    onChange: (dataUrl: string) => void;
}) {
    const canvasRef  = useRef<HTMLCanvasElement>(null);
    const drawing    = useRef(false);
    const lastPos    = useRef<{ x: number; y: number } | null>(null);

    // Load existing signature into canvas on mount
    useEffect(() => {
        if (!value || !canvasRef.current) return;
        const img = new Image();
        img.onload = () => {
            const ctx = canvasRef.current!.getContext('2d')!;
            ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = value;
    }, []);

    function getPos(e: React.MouseEvent | React.TouchEvent) {
        const rect = canvasRef.current!.getBoundingClientRect();
        const src  = 'touches' in e ? e.touches[0] : e;
        return { x: src.clientX - rect.left, y: src.clientY - rect.top };
    }

    function startDraw(e: React.MouseEvent | React.TouchEvent) {
        e.preventDefault();
        drawing.current = true;
        lastPos.current = getPos(e);
    }

    function draw(e: React.MouseEvent | React.TouchEvent) {
        e.preventDefault();
        if (!drawing.current || !canvasRef.current) return;
        const ctx  = canvasRef.current.getContext('2d')!;
        const pos  = getPos(e);
        ctx.beginPath();
        ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth   = 1.5;
        ctx.lineCap     = 'round';
        ctx.stroke();
        lastPos.current = pos;
    }

    function stopDraw() {
        if (!drawing.current || !canvasRef.current) return;
        drawing.current = false;
        onChange(canvasRef.current.toDataURL());
    }

    function clearPad() {
        const ctx = canvasRef.current!.getContext('2d')!;
        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        onChange('');
    }

    return (
        <div className="relative w-full max-w-sm">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={160}
                    className="w-full cursor-crosshair touch-none"
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={stopDraw}
                />
                <div className="flex items-center justify-between border-t border-gray-100 px-3 py-1.5">
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-300">
                        Draw inside box
                    </span>
                    <button
                        type="button"
                        onClick={clearPad}
                        className="rounded border border-gray-200 px-2 py-0.5 text-[10px] text-gray-500 hover:bg-gray-50"
                    >
                        Clear Pad
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MyProfile({ user }: Props) {
    const nameParts = splitName(user.name);

    const { data, setData, processing, errors } = useForm({
        first_name:  nameParts.first,
        middle_name: nameParts.middle,
        last_name:   nameParts.last,
        email:       user.email,
        phone:       user.phone ?? '',
        username:    user.username ?? '',
        password:    '',
        role:        user.role,
        signature:   user.signature ?? '',
        avatar:      null as File | null,
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        user.avatar ? `/storage/${user.avatar}` : null,
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setData('avatar', file);
        if (file) setAvatarPreview(URL.createObjectURL(file));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const fullName = joinName(data.first_name, data.middle_name, data.last_name);

        const payload = new FormData();
        payload.append('_method', 'PUT');
        payload.append('name',      fullName);
        payload.append('email',     data.email);
        payload.append('phone',     data.phone);
        payload.append('username',  data.username);
        payload.append('role',      data.role);
        payload.append('signature', data.signature);
        if (data.password) payload.append('password', data.password);
        if (data.avatar)   payload.append('avatar', data.avatar);

        router.post('/my-profile', payload);
    }

    const displayName = joinName(data.first_name, data.middle_name, data.last_name) || user.name;

    return (
        <>
            <Head title="My Profile" />
            <AppLayout title="My Profile">
                {/* Back link */}
                <Link
                    href="/user-accounts"
                    className="mb-4 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                >
                    <ChevronLeftIcon className="h-3.5 w-3.5" />
                    Back to Account List
                </Link>

                <div className="mx-auto max-w-2xl">
                    <div className="mb-5">
                        <h2 className="text-xl font-bold text-gray-800">Modify Profile</h2>
                        <p className="text-xs text-gray-500">
                            Update the details and password credentials of this account.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                        {/* ── Profile Information ───────────────────── */}
                        <SectionHeader label="Profile Information" />
                        <div className="px-6 pt-5 pb-4 space-y-4">

                            {/* Name row */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label text="First Name" required />
                                    <input
                                        type="text"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        className={inputCls(!!errors.name)}
                                    />
                                </div>
                                <div>
                                    <Label text="Middle Name" />
                                    <input
                                        type="text"
                                        value={data.middle_name}
                                        onChange={(e) => setData('middle_name', e.target.value)}
                                        className={inputCls(false)}
                                    />
                                </div>
                                <div>
                                    <Label text="Last Name" required />
                                    <input
                                        type="text"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        className={inputCls(false)}
                                    />
                                </div>
                            </div>
                            {errors.name && <p className="text-[10px] text-red-500">{errors.name}</p>}

                            {/* Email + Phone */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label text="Email Address" required />
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={inputCls(!!errors.email)}
                                    />
                                    <FieldError msg={errors.email} />
                                </div>
                                <div>
                                    <Label text="Contact Number" />
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="09XX XXX XXXX"
                                        className={inputCls(!!errors.phone)}
                                    />
                                    <FieldError msg={errors.phone} />
                                </div>
                            </div>

                            {/* Avatar */}
                            <div className="flex items-center gap-4">
                                {/* Preview */}
                                <div className={cn(
                                    'flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white',
                                    avatarPreview ? '' : AVATAR_BG,
                                )}>
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="avatar"
                                            className="h-14 w-14 rounded-full object-cover" />
                                    ) : (
                                        initials(displayName)
                                    )}
                                </div>
                                <div>
                                    <p className="mb-1 text-xs font-medium text-gray-700">Profile Image</p>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="rounded border border-[#e63946] px-3 py-1.5 text-xs font-semibold text-[#e63946] hover:bg-red-50"
                                    >
                                        Choose file
                                    </button>
                                    <span className="ml-2 text-xs text-gray-400">
                                        {data.avatar ? data.avatar.name : 'No file chosen'}
                                    </span>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                    <p className="mt-1 text-[10px] text-gray-400">
                                        JPEG, PNG, or WebP. Max 2MB.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ── E-Signature ───────────────────────────── */}
                        <div className="border-t border-gray-100 px-6 pt-4 pb-5">
                            <p className="mb-0.5 text-sm font-semibold text-gray-700">
                                E-Signature <span className="font-normal text-gray-400">(Optional)</span>
                            </p>
                            <p className="mb-3 text-xs text-blue-500">
                                Draw your signature below to save it as a digital sign-off on your profile.
                            </p>
                            <SignaturePad
                                value={data.signature}
                                onChange={(val) => setData('signature', val)}
                            />
                        </div>

                        {/* ── Access Credentials ────────────────────── */}
                        <SectionHeader label="Access Credentials" />
                        <div className="px-6 pt-5 pb-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label text="Username" required />
                                    <input
                                        type="text"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        className={inputCls(!!errors.username)}
                                    />
                                    <FieldError msg={errors.username} />
                                </div>
                                <div>
                                    <Label text="Password" />
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Leave blank to keep current"
                                        className={inputCls(!!errors.password)}
                                    />
                                    <FieldError msg={errors.password} />
                                </div>
                                <div>
                                    <Label text="System Role" required />
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className={cn(inputCls(false), 'appearance-none bg-white')}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="tech_support">Tech Support</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ── Footer buttons ────────────────────────── */}
                        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
                            <Link
                                href="/user-accounts"
                                className="rounded border border-gray-200 px-5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded bg-[#e63946] px-5 py-2 text-xs font-semibold text-white hover:bg-[#c1121f] disabled:opacity-60"
                            >
                                {processing ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </AppLayout>
        </>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
    return (
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-2.5">
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
    return cn(
        'w-full rounded border px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:outline-none',
        error ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
              : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100',
    );
}

function ChevronLeftIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
    );
}
