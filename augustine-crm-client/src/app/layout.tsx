import Sidebar from '../components/Sidebar';
import { QueryProvider } from '../providers/QueryProvider';
import './globals.css';

export const metadata = {
  title: 'Augustine CRM',
  description: 'Sales & Leads Management Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Sidebar />
        <main className="ml-64 min-h-screen bg-purplecrm-50 p-8">
          <QueryProvider>{children}</QueryProvider>
        </main>{' '}
      </body>
    </html>
  );
}
