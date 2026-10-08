import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { isOwner } from "@/lib/session";

export const metadata: Metadata = {
  title: "Rebec's Cookbook",
  description: "A collection of family recipes.",
  openGraph: {
    title: "Rebec's Cookbook",
    description: "A collection of family recipes.",
    siteName: "Rebec's Cookbook",
    type: "website",
  },
  appleWebApp: {
    title: "Rebec's Cookbook",
  },
};

export const viewport: Viewport = {
  themeColor: "#7B4B32",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const owner = await isOwner();

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-amber-50 text-stone-900 antialiased">
        <Header isOwner={owner} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <Footer isOwner={owner} />
      </body>
    </html>
  );
}
