import AppLayout from '@/layouts/AppLayout';
import { cn } from '@/lib/utils';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
    id: number;
    name: string;
    username: string | null;
    email: string;
    phone: string | null;
    role: 'admin' | 'tech_support';
    avatar: string | null;
}

interface Paginated {
    data: User[];
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
    role?: string;
    per_page?: string;
}

interface Props {
    users: Paginated;
    filters: Filters;
}

// ─── Avatar colours (consistent per user id) ─────────────────────────────────

const AVATAR_COLORS = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-600',
    'bg-teal-600', 'bg-blue-600', 'bg-indigo-600', 'bg-purple-600',
    'bg-pink-600', 'bg-rose-600',
];

function avatarColor(id: number) {
    return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function initials(name: string) {
    return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

// ─── Role badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: User['role'] }) {
    return (
        <span className={cn(
            'inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
            role === 'admin' ? 'text-[#e63946]' : 'text-teal-600',
        )}>
            {role === 'admin' ? 'Admin' : 'Tech Support'}
        </span>
    );
}

// ─── User form (add / edit) ───────────────────────────────────────────────────

interface UserFormData {
    name: string;
    username: string;
    email: string;
    phone: string;
    role: string;
    password: string;
    [key: string]: string;
}

function UserModal({
    user,
    onClose,
}: {
    user: User | null; // null = add mode
    onClose: () => void;
}) {
    const isEdit = user !== null;

    const { data, setData, post, put, processing, errors, reset } =
        useForm<UserFormData>({
            name:     user?.name     ?? '',
            username: user?.username ?? '',
            email:    user?.email    ?? '',
            phone:    user?.phone    ?? '',
            role:     user?.role     ?? 'tech_support',
            password: '',
        });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isEdit) {
            put(`/user-accounts/${user.id}`, { onSuccess: onClose });
        } else {
            post('/user-accounts', { onSuccess: () => { reset(); onClose(); } });
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
                    <h3 className="text-sm font-bold text-gray-800">
                        {isEdit ? 'Edit User Account' : 'Add New User Account'}
                    </h3>
                    <button type="button" onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600">
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Full name */}
                        <div className="col-span-2">
                            <ModalLabel text="Full Name" required />
                            <input type="text" value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Juan dela Cruz"
                                className={modalInput(!!errors.name)} />
                            <ModalError msg={errors.name} />
                        </div>

                        {/* Username */}
                        <div>
                            <ModalLabel text="Username" required />
                            <input type="text" value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                placeholder="e.g. jdelacruz"
                                className={modalInput(!!errors.username)} />
                            <ModalError msg={errors.username} />
                        </div>

                        {/* Phone */}
                        <div>
                            <ModalLabel text="Contact Number" />
                            <input type="text" value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="e.g. 09XX XXX XXXX"
                                className={modalInput(!!errors.phone)} />
                            <ModalError msg={errors.phone} />
                        </div>

                        {/* Email */}
                        <div className="col-span-2">
                            <ModalLabel text="Email Address" required />
                            <input type="email" value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="e.g. juan@sfac.edu.ph"
                                className={modalInput(!!errors.email)} />
                            <ModalError msg={errors.email} />
                        </div>

                        {/* Role */}
                        <div>
                            <ModalLabel text="System Role" required />
                            <select value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className={cn(modalInput(!!errors.role), 'bg-white appearance-none')}>
                                <option value="tech_support">Tech Support</option>
                                <option value="admin">Admin</option>
                            </select>
                            <ModalError msg={errors.role} />
                        </div>

                        {/* Password */}
                        <div>
                            <ModalLabel text={isEdit ? 'New Password (leave blank to keep)' : 'Password'} required={!isEdit ? false : undefined} />
                            <input type="password" value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder={isEdit ? '••••••••' : 'Min. 8 characters'}
                                className={modalInput(!!errors.password)} />
                            <ModalError msg={errors.password} />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <button type="button" onClick={onClose}
                            className="rounded border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing}
                            className="rounded bg-[#1a1a2e] px-5 py-2 text-xs font-semibold text-white hover:bg-[#16213e] disabled:opacity-60">
                            {processing ? 'Saving…' : isEdit ? 'Save Changes' : 'Add User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function UserAccountsIndex({ users, filters }: Props) {
    const { flash, auth } = usePage<{
        flash: { success: string | null };
        auth: { user: { role: string } | null };
    }>().props;

    const isAdmin = auth?.user?.role === 'admin';

    const [search, setSearch]   = useState(filters.search ?? '');
    const [role, setRole]       = useState(filters.role ?? '');
    const [modal, setModal]     = useState<'add' | User | null>(null);

    const applyFilters = useCallback((overrides: Partial<Filters & { page?: string }> = {}) => {
        router.get('/user-accounts', { search, role, ...overrides },
            { preserveState: true, replace: true });
    }, [search, role]);

    function handleDelete(user: User) {
        if (!confirm(`Delete ${user.name}? This cannot be undone.`)) return;
        router.delete(`/user-accounts/${user.id}`);
    }

    const { data, from, to, total, links, current_page, last_page, per_page } = users;

    return (
        <>
            <Head title="User Accounts" />
            <AppLayout title="User Accounts">

                {/* Flash */}
                {flash?.success && (
                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                {/* Page header */}
                <div className="mb-5 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">System Accounts</h2>
                        <p className="mt-0.5 text-xs text-gray-500">
                            Manage details and login credentials of all technical and administrative personnel.
                        </p>
                    </div>
                    {isAdmin && (
                    <button
                        type="button"
                        onClick={() => setModal('add')}
                        className="flex items-center gap-1.5 rounded bg-[#e63946] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#c1121f]"
                    >
                        <PlusIcon className="h-3.5 w-3.5" />
                        Add User Account
                    </button>
                    )}
                </div>

                {/* Search + filter bar */}
                <div className="mb-4 flex items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <SearchIcon className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search name, username, email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            className="w-full rounded border border-gray-200 py-2 pr-3 pl-8 text-xs text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>
                    {/* Role filter */}
                    <select
                        value={role}
                        onChange={(e) => { setRole(e.target.value); applyFilters({ role: e.target.value }); }}
                        className="rounded border border-gray-200 px-2 py-2 text-xs text-gray-700 focus:outline-none"
                    >
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="tech_support">Tech Support</option>
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100 text-xs">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Personnel', 'Username', 'Contact Details', 'System Role', 'Actions'].map((h) => (
                                        <th key={h} className={cn(
                                            'px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-500',
                                            h === 'Actions' && 'text-right',
                                        )}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center text-gray-400">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : data.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        {/* Personnel */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {user.avatar ? (
                                                    <img src={`/storage/${user.avatar}`} alt={user.name}
                                                        className="h-9 w-9 rounded-full object-cover" />
                                                ) : (
                                                    <div className={cn(
                                                        'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
                                                        avatarColor(user.id),
                                                    )}>
                                                        {initials(user.name)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-800">{user.name}</p>
                                                    <p className="text-[10px] text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Username */}
                                        <td className="px-4 py-3 text-gray-700">
                                            {user.username ?? <span className="text-gray-300">—</span>}
                                        </td>
                                        {/* Contact */}
                                        <td className="px-4 py-3 text-gray-600">
                                            {user.phone ?? <span className="text-gray-300">—</span>}
                                        </td>
                                        {/* Role */}
                                        <td className="px-4 py-3">
                                            <RoleBadge role={user.role} />
                                        </td>
                                        {/* Actions */}
                                        <td className="px-4 py-3 text-right">
                                            {isAdmin ? (
                                                <div className="flex items-center justify-end gap-3">
                                                    <button type="button"
                                                        onClick={() => setModal(user)}
                                                        className="text-blue-500 hover:text-blue-700">
                                                        Edit
                                                    </button>
                                                    <button type="button"
                                                        onClick={() => handleDelete(user)}
                                                        className="text-red-500 hover:text-red-700">
                                                        Delete
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-gray-300">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination footer */}
                    <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Show</span>
                            <select
                                value={per_page}
                                onChange={(e) => applyFilters({ per_page: e.target.value })}
                                className="rounded border border-gray-200 px-1.5 py-1 text-xs text-gray-700 focus:outline-none"
                            >
                                {[10, 25, 50].map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                            <span>Showing {from ?? 0}–{to ?? 0} of {total} entries</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <PageBtn label="← Prev" disabled={current_page === 1}
                                onClick={() => applyFilters({ page: String(current_page - 1) })} />
                            {links
                                .filter((l) => !l.label.includes('Previous') && !l.label.includes('Next'))
                                .map((l) => (
                                    <PageBtn key={l.label} label={l.label} active={l.active}
                                        disabled={!l.url}
                                        onClick={() => { if (l.url) router.visit(l.url); }} />
                                ))}
                            <PageBtn label="Next →" disabled={current_page === last_page}
                                onClick={() => applyFilters({ page: String(current_page + 1) })} />
                        </div>
                    </div>
                </div>

                <p className="mt-6 text-center text-[10px] text-gray-400">
                    System developed by <strong className="text-gray-500">TEAM MISO</strong> · Saint Francis of Assisi College
                </p>
            </AppLayout>

            {/* Modal */}
            {modal !== null && (
                <UserModal
                    user={modal === 'add' ? null : modal}
                    onClose={() => setModal(null)}
                />
            )}
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

function ModalLabel({ text, required }: { text: string; required?: boolean }) {
    return (
        <label className="mb-1 block text-xs font-medium text-gray-700">
            {text}{required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
    );
}

function ModalError({ msg }: { msg?: string }) {
    if (!msg) return null;
    return <p className="mt-0.5 text-[10px] text-red-500">{msg}</p>;
}

function modalInput(error: boolean) {
    return cn(
        'w-full rounded border px-3 py-2 text-xs text-gray-700 focus:ring-1 focus:outline-none',
        error ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
              : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100',
    );
}

function SearchIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" /></svg>;
}
function PlusIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
}
