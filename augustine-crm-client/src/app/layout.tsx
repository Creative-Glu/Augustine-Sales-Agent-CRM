import { QueryProvider } from '../providers/QueryProvider';
import './globals.css';
import { ToastProvider } from '../hooks/use-toast';
import { ClerkProvider } from '@clerk/nextjs';
export const metadata = {
  title: 'Augustine CRM',
  description: 'Sales & Leads Management Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <main className="ml-64 min-h-screen bg-purplecrm-50 p-8">
            <QueryProvider>{children}</QueryProvider>
            <ToastProvider />
          </main>{' '}
        </body>
      </html>
    </ClerkProvider>
  );
}
