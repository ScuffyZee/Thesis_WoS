import type { Auth } from '@/types/auth';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth & { role: string | null };
            sidebarOpen: boolean;
            flash: {
                success: string | null;
                error: string | null;
            };
            [key: string]: unknown;
        };
    }
}
