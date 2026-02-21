import './globals.css';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-slate-900 text-white p-3 flex gap-4 text-sm overflow-x-auto">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/calendar">Calendar</Link>
          <Link href="/events">Events</Link>
          <Link href="/me">My Profile</Link>
          <Link href="/reports">Reports</Link>
        </nav>
        <main className="p-4 max-w-6xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
