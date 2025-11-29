import "./globals.css";
import type { Metadata } from "next";
import { SessionProvider } from "@/components/SessionProvider";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "VBS App",
  description: "Vacation Bible School admin & check-in",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Navigation />
          <main className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
