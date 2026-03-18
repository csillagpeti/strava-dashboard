import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Strava Dashboard",
  description: "Personal Strava statistics and trends",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Strava Dashboard",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#f97316" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased bg-gray-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
