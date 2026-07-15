import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "FPT Jobs - Cổng Thông Tin Tuyển Dụng Chính Thức Của FPT Telecom",
  description: "Cổng thông tin việc làm và cơ hội nghề nghiệp tại FPT Telecom",
  icons: {
    icon: "/seo/fptjobs-com-public-img-favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
