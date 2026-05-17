import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "簽證資訊 | 工作簽證 | 人才招聘 | HKTE",
  description: "香港特別行政區政府為有意來港工作及定居的專業人才提供七項人才入境計劃",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-HK" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-noto-sans">{children}</body>
    </html>
  );
}
