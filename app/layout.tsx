import type { Metadata } from "next";
import "@/styles/globals.css";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
