import { Head, Link } from '@inertiajs/react';

interface Props {
    orderNumber: string | null;
}

export default function RequestSuccess({ orderNumber }: Props) {
    return (
        <>
            <Head title="Request Submitted" />
            <div className="flex min-h-screen flex-col bg-gray-100">

                {/* Top bar */}
                <header className="bg-[#1a1a2e] px-6 py-4 shadow-md">
                    <div className="mx-auto flex max-w-2xl items-center gap-3">
                        <div className="flex items-center gap-1">
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#e63946] text-xs font-bold text-white">
                                MISO
                            </div>
                            <span className="text-xs font-bold tracking-widest text-[#e63946]">WOS</span>
                        </div>
                        <div className="h-5 w-px bg-white/20" />
                        <p className="text-sm font-semibold text-white">Work Order Request</p>
                    </div>
                </header>

                {/* Success card */}
                <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16">
                    <div className="w-full rounded-xl border border-gray-200 bg-white px-8 py-10 text-center shadow-sm">

                        {/* Check icon */}
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h1 className="mb-2 text-2xl font-bold text-gray-800">Request Submitted!</h1>
                        <p className="mb-6 text-sm text-gray-500">
                            Your work order request has been received by the MIS Office.
                            You will be notified once it has been reviewed and assigned.
                        </p>

                        {orderNumber && (
                            <div className="mb-6 inline-block rounded-lg border border-gray-200 bg-gray-50 px-6 py-4">
                                <p className="mb-1 text-xs text-gray-500 uppercase tracking-widest font-semibold">Your Order Number</p>
                                <p className="font-mono text-2xl font-bold text-[#1a1a2e]">{orderNumber}</p>
                                <p className="mt-1 text-[10px] text-gray-400">Keep this for reference when following up.</p>
                            </div>
                        )}

                        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                            <Link
                                href="/request"
                                className="w-full rounded-lg bg-[#e63946] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#c1121f] sm:w-auto"
                            >
                                Submit Another Request
                            </Link>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-[10px] text-gray-400">
                        System developed by <strong className="text-gray-500">TEAM MISO</strong> · Saint Francis of Assisi College
                    </p>
                </main>
            </div>
        </>
    );
}
