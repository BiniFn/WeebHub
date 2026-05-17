import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeebHub Docs",
  description: "WeebHub Documentation - Your personal anime streaming server",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#09090f] text-[#e2e8f0] min-h-screen">
        {children}
      </body>
    </html>
  );
}