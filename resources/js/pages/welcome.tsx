import { Head, useForm } from '@inertiajs/react';

export default function Welcome() {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        password: '',
        remember: false as boolean,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/login');
    }

    return (
        <>
            <Head title="Sign In" />
            <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#050817] via-[#33070d] to-[#050817]">
                <section className="w-full max-w-[300px] rounded-2xl border border-[#25283d] bg-[#180d1d] p-7 shadow-2xl">
                    {/* Logo / branding */}
                    <div className="mb-7 text-center">
                        <img
                            src="/images/miso-logo.png"
                            alt="MISO"
                            className="mx-auto mb-4 h-20 w-20 object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                        <p className="text-xs text-blue-300">Saint Francis of Assisi College</p>
                        <p className="text-xs text-blue-300">Work Order System</p>
                        <h1 className="mt-1 text-2xl font-bold text-white">
                            MISO <span className="text-red-500">| WOS</span>
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className="text-[10px] font-bold tracking-widest text-gray-400">
                                USERNAME
                            </label>
                            <input
                                type="text"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                placeholder="Enter your username"
                                autoComplete="username"
                                autoFocus
                                className="mt-1 w-full rounded-xl border border-gray-700 bg-[#100b18] px-3 py-3 text-sm text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            />
                            {errors.username && (
                                <p className="mt-1 text-[11px] text-red-400">{errors.username}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-[10px] font-bold tracking-widest text-gray-400">
                                PASSWORD
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                className="mt-1 w-full rounded-xl border border-gray-700 bg-[#100b18] px-3 py-3 text-sm text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            />
                            {errors.password && (
                                <p className="mt-1 text-[11px] text-red-400">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember */}
                        <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-400">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded border-gray-600 bg-transparent accent-red-500"
                            />
                            Remember session
                        </label>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
                        >
                            {processing ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>
                </section>
            </main>
        </>
    );
}
