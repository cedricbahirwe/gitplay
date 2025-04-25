'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    session: Session | null;
}

export function SessionProvider({ children, session }: Props) {
    return (
        <NextAuthSessionProvider
            session={session}
            refetchInterval={0}
            refetchWhenOffline={false}
            refetchOnWindowFocus={true}  // Changed to true to enable session refresh on tab focus
        >
            {children}
        </NextAuthSessionProvider>
    );
}