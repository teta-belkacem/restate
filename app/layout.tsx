import type { Metadata } from "next";
import "@/styles/globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body >
        {children}
      </body>
    </html>
  );
}
