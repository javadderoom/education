import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "سامانه ارزیابی شناختی و تشخیصی کسرها | پایه چهارم",
  description: "سامانه ارزیابی تشخیصی مبتنی بر ردیابی شناختی بیزی (BKT) و بدفهمی‌شناسی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css"
          integrity="sha384-zh0WIMx9Nq3qK4Ex23zX669E36wY6D6v4o08j8lC5Y+V6Z1R5L+k9K7vN5R5J8+"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                ک
              </div>
              <div>
                <h1 className="font-bold text-sm text-slate-900">سامانه تشخیصی ریاضی دبستان</h1>
                <p className="text-[11px] text-slate-500">پایه چهارم • فصل دوم: کسرها</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                موتور BKT فعال
              </span>
            </div>
          </div>
        </header>

        <main className="py-6">{children}</main>

        <footer className="mt-auto py-6 border-t border-slate-200 text-center text-xs text-slate-400">
          سامانه متن‌باز ارزیابی تشخیصی شناختی • بر پایه راهنمای تدریس مصوب پایگاه کتاب‌های درسی ایران
        </footer>
      </body>
    </html>
  );
}
