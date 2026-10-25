import AppLayout from '@/layouts/AppLayout';
import { Head } from '@inertiajs/react';

interface Props {
    page: string;
}

export default function UnderConstruction({ page }: Props) {
    return (
        <>
            <Head title={page} />
            <AppLayout title={page}>
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    {/* Icon */}
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
                        <svg className="h-10 w-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                        </svg>
                    </div>

                    <h2 className="mb-2 text-xl font-bold text-gray-800">Page Under Construction</h2>
                    <p className="max-w-sm text-sm text-gray-500">
                        <strong className="text-gray-700">{page}</strong> is currently being developed
                        and will be available in a future update.
                    </p>

                    <div className="mt-6 rounded-lg border border-amber-100 bg-amber-50 px-5 py-3">
                        <p className="text-xs font-medium text-amber-700">Coming soon — stay tuned!</p>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
