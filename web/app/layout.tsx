import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Vazirmatn } from "next/font/google";
import { Header } from "@/components/navigation/Header";
import { BottomNav } from "@/components/navigation/BottomNav";
import { CurriculumProvider } from "@/lib/store/curriculum-store";
import { Agentation } from "agentation";
import "./globals.css";
import "katex/dist/katex.min.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: "سامانه ارزیابی مفهومی و تشخیصی ریاضی | دوره دوم ابتدایی",
  description: "سامانه ارزیابی تشخیصی، سنجش انطباقی و یادگیری مفهومی ریاضی دبستان",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`h-full ${vazirmatn.className} ${vazirmatn.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css"
          integrity="sha384-zh0WIMx9Nq3qK4Ex23zX669E36wY6D6v4o08j8lC5Y+V6Z1R5L+k9K7vN5R5J8+"
          crossOrigin="anonymous"
        />
      </head>
      <body className="h-full flex flex-col justify-between">
        <CurriculumProvider>
          {/* Mobile & Tablet App Shell (Responsive Centered Tablet Frame on Desktop) */}
          <div className="w-full max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto min-h-screen bg-white shadow-2xl flex flex-col border-x border-slate-200">
            <Suspense fallback={<div className="h-14 bg-white border-b border-slate-100" />}>
              <Header />
            </Suspense>

            <main className="flex-1 flex flex-col overflow-y-auto px-4 pt-3 pb-24 sm:pb-28">
              <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">در حال بارگذاری...</div>}>
                {children}
              </Suspense>
            </main>

            <Suspense fallback={null}>
              <BottomNav />
            </Suspense>
          </div>
        </CurriculumProvider>
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
