import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { router } from '@inertiajs/react';

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
    { label: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
    { label: 'Work Orders', href: '/work-orders', icon: WorkOrderIcon },
    { label: 'MISO Inventory', href: '#', icon: InventoryIcon },
    { label: 'MISO Repository', href: '#', icon: RepositoryIcon },
    { label: 'User Accounts', href: '/user-accounts', icon: UsersIcon },
    { label: 'System Config', href: '#', icon: SettingsIcon },
    { label: 'My Profile', href: '/my-profile', icon: ProfileIcon },
] as const;

// ─── Layout ───────────────────────────────────────────────────────────────────

interface Props {
    children: ReactNode;
    /** Page title shown in the top bar breadcrumb area. */
    title?: string;
}

export default function AppLayout({ children, title }: Props) {
    const { url } = usePage();

    const logout = () => {
        router.post('/logout');
    };

    const { auth } = usePage<{
        auth: { user: { name: string } | null; role: string | null };
    }>().props;

    const user = auth?.user;
    const initials = user?.name
        ? user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()
        : 'ZL';

    // Format today's date
    const today = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* ── Sidebar ───────────────────────────────────────────────── */}
            <aside className="flex w-[88px] flex-shrink-0 flex-col bg-[#1a1a2e] text-white">
                {/* Logo */}
                <div className="flex items-center justify-center gap-1 border-b border-white/10 px-2 py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-[#e63946] text-xs font-bold text-white">
                        MISO
                    </div>
                    <span className="text-xs font-bold tracking-widest text-[#e63946]">
                        WOS
                    </span>
                </div>

                {/* User avatar */}
                <div className="flex flex-col items-center gap-1 border-b border-white/10 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-sm font-semibold text-white">
                        {initials}
                    </div>
                    <p className="max-w-[72px] truncate text-center text-[10px] font-medium leading-tight text-white">
                        {user?.name ?? 'Zidane Llavor'}
                    </p>
                    <span className="rounded bg-[#e63946] px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-white">
                        {auth?.role ?? 'Admin'}
                    </span>
                </div>

                {/* Nav */}
                <nav className="flex flex-1 flex-col gap-0.5 px-2 py-3">
                    {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                        const active =
                            href === '/dashboard'
                                ? url === '/dashboard'
                                : url.startsWith(href);
                        return (
                            <Link
                                key={label}
                                href={href}
                                className={cn(
                                    'flex flex-col items-center gap-1 rounded px-1 py-2 text-center text-[10px] leading-tight transition-colors',
                                    active
                                        ? 'bg-[#e63946] text-white'
                                        : 'text-white/60 hover:bg-white/10 hover:text-white',
                                )}
                            >
                                <Icon className="h-4 w-4 flex-shrink-0" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

            </aside>

            {/* ── Main area ─────────────────────────────────────────────── */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top bar */}
                <header className="flex h-12 items-center justify-between border-b border-gray-200 bg-white px-6">
                    <h1 className="text-base font-semibold text-gray-800">
                        {title ?? 'Work Order Logs'}
                    </h1>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                            <span className="font-medium uppercase tracking-wide text-gray-400">
                                Date Today
                            </span>
                            <br />
                            <span className="text-gray-700">{today}</span>
                        </span>
                        <button
                            type="button"
                            onClick={logout}
                            className="flex items-center gap-1 rounded border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                        >
                            <LogoutIcon className="h-3.5 w-3.5" />
                            Logout
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto p-6">{children}</main>
            </div>
        </div>
    );
}

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

function DashboardIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    );
}

function WorkOrderIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
        </svg>
    );
}

function InventoryIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
            />
        </svg>
    );
}

function RepositoryIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
        </svg>
    );
}

function UsersIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
        </svg>
    );
}

function SettingsIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
        </svg>
    );
}

function ProfileIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
        </svg>
    );
}

function LogoutIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
        </svg>
    );
}


