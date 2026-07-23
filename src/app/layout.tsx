import type { Metadata } from "next";
import { Suspense } from "react";

import { VisitTracker } from "@/components/analytics/VisitTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "kaireview",
  description:
    "kaireview là trang giới thiệu, đánh giá và khuyên dùng các sản phẩm, dịch vụ.",
  icons: {
    icon: "/images/kai-favicon.svg",
    apple: "/images/kai-favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <VisitTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
