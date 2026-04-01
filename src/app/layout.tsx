import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 마케팅 실습 포털 | 아크랩스(AKLabs)",
  description: "아크랩스 AI 마케팅 실습 및 활동 기록을 위한 통합 포털입니다. 팀별 활동과 프롬프트를 안전하게 기록하세요.",
  keywords: ["AKLabs", "아크랩스", "AI 마케팅", "실습 기록", "포털"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className={`${inter.variable} antialiased selection:bg-blue-500/30`}>
        {children}
      </body>
    </html>
  );
}
