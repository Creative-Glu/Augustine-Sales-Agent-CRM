import { QueryProvider } from '../providers/QueryProvider';
import './globals.css';
import { ToastProvider } from '../hooks/use-toast';
import { AuthProvider } from '../providers/AuthProvider';

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
          <ToastProvider />
        </main>
      </body>
    </html>
  );
}

