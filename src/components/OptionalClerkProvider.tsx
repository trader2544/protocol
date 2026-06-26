import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;

export default function OptionalClerkProvider({ children }: { children: React.ReactNode }) {
  if (!PUBLISHABLE_KEY) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      {children}
    </ClerkProvider>
  );
}
