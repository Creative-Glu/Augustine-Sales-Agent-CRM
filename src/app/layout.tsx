import { QueryProvider } from '../providers/QueryProvider';
import './globals.css';
import { AuthProvider } from '../providers/AuthProvider';
import { ThemeProvider } from '../providers/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider as ReactToastifyProvider } from '@/hooks/use-toast';

export const metadata = {
  title: 'Augustine CRM',
  description: 'Sales & Leads Management Platform',
};

// Runs synchronously before React hydrates so dark mode users don't see a
// flash of light theme. Reads the same localStorage key the ThemeProvider
// uses ('augustine.theme'), falls back to the OS preference.
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('augustine.theme');
    var theme = stored === 'dark' || stored === 'light'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <main>
          <ThemeProvider>
            <QueryProvider>
              <AuthProvider>{children}</AuthProvider>
            </QueryProvider>
            <Toaster />
            <ReactToastifyProvider />
          </ThemeProvider>
        </main>
      </body>
    </html>
  );
}

