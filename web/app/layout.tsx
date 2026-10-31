import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "سامانه ارزیابی تشخیصی کسرها | پایه چهارم",
  description: "سامانه ارزیابی تشخیصی و یادگیری مفهومی ریاضی دبستان",
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
    <html lang="fa" dir="rtl" className="h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css"
          integrity="sha384-zh0WIMx9Nq3qK4Ex23zX669E36wY6D6v4o08j8lC5Y+V6Z1R5L+k9K7vN5R5J8+"
          crossOrigin="anonymous"
        />
      </head>
      <body className="h-full flex flex-col justify-between">
        {/* Mobile & Tablet App Shell (Responsive Centered Tablet Frame on Desktop) */}
        <div className="w-full max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto min-h-screen bg-white shadow-2xl flex flex-col border-x border-slate-200">
          <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-4 py-3 shrink-0">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow-sm">
                  ک
                </div>
                <div>
                  <h1 className="font-bold text-sm text-slate-900 leading-tight">ریاضی پایه چهارم</h1>
                  <p className="text-[11px] text-slate-500">فصل ۲: شناخت کسرها</p>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="text-xs font-bold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  آزمون دانش‌آموز
                </Link>
                <Link
                  href="/curation"
                  className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  میز آموزگار
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 flex flex-col overflow-y-auto px-4 py-4">{children}</main>

          <footer className="py-3 px-4 border-t border-slate-100 text-center text-[11px] text-slate-400 bg-slate-50/50 shrink-0">
            آموزش و پرورش • کتاب و راهنمای تدریس ریاضی چهارم دبستان
          </footer>
        </div>
      </body>
    </html>
  );
}
