import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VBS App',
  description: 'Vacation Bible School admin & check-in',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/">Home</Link>
            <Link href="/dashboard">Staff Dashboard</Link>
            <Link href="/students">Students</Link>
            <Link href="/checkin">Check-In</Link>
            <Link href="/attendance">Attendance</Link>
            <Link href="/schedule">Schedule</Link>
            <a
              href="https://forms.google.com"
              target="_blank"
              rel="noreferrer"
            >
              Registration Form
            </a>
          </nav>
        </header>
        <main style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
