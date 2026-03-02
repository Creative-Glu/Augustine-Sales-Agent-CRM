import { QueryProvider } from '../providers/QueryProvider';
import './globals.css';
import { AuthProvider } from '../providers/AuthProvider';
import { Toaster } from '@/components/ui/toaster';

export const metadata = {
  title: 'Augustine CRM',
  description: 'Sales & Leads Management Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
          <Toaster />
        </main>
      </body>
    </html>
  );
}

