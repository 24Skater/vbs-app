import "./globals.css";
import type { Metadata } from "next";
import { SessionProvider } from "@/components/SessionProvider";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { BrandingProvider } from "@/components/BrandingProvider";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSettings();
    return {
      title: settings.siteName,
      description: settings.tagline || "Vacation Bible School Management",
    };
  } catch {
    return {
      title: "VBS App",
      description: "Vacation Bible School admin & check-in",
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let branding;
  try {
    const settings = await getSettings();
    branding = {
      siteName: settings.siteName,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      logoUrl: settings.logoUrl,
      churchName: settings.churchName,
      churchAddress: settings.churchAddress,
      churchCity: settings.churchCity,
      churchState: settings.churchState,
      churchZip: settings.churchZip,
      churchPhone: settings.churchPhone,
      churchEmail: settings.churchEmail,
      churchWebsite: settings.churchWebsite,
      tagline: settings.tagline,
      welcomeMessage: settings.welcomeMessage,
      footerText: settings.footerText,
      facebookUrl: settings.facebookUrl,
      instagramUrl: settings.instagramUrl,
      youtubeUrl: settings.youtubeUrl,
      googleFormsEnabled: settings.googleFormsEnabled,
      googleFormsUrl: settings.googleFormsUrl,
    };
  } catch {
    branding = {
      siteName: "VBS App",
      primaryColor: "#2563eb",
      secondaryColor: "#1e40af",
      logoUrl: null,
      churchName: null,
      churchAddress: null,
      churchCity: null,
      churchState: null,
      churchZip: null,
      churchPhone: null,
      churchEmail: null,
      churchWebsite: null,
      tagline: null,
      welcomeMessage: null,
      footerText: null,
      facebookUrl: null,
      instagramUrl: null,
      youtubeUrl: null,
      googleFormsEnabled: false,
      googleFormsUrl: null,
    };
  }

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <SessionProvider>
          <BrandingProvider settings={branding}>
            <Navigation />
            <main className="flex-1 bg-gray-50">
              <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
            <Footer />
          </BrandingProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
