import Sidebar from "../components/Sidebar";
import "./globals.css";

export const metadata = {
  title: "Augustine CRM",
  description: "Sales & Leads Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex">
        <Sidebar />
        <main className="ml-64 w-full min-h-screen bg-purplecrm-50 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
