import type { Metadata, Viewport } from "next";
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
        <div className="w-full max-w-xl md:max-w-2xl mx-auto min-h-screen bg-white shadow-2xl flex flex-col border-x border-slate-200">
          <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-4 py-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow-sm">
                  ک
                </div>
                <div>
                  <h1 className="font-bold text-sm text-slate-900 leading-tight">ریاضی پایه چهارم</h1>
                  <p className="text-[11px] text-slate-500">فصل ۲: شناخت کسرها</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  آماده آزمون
                </span>
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
