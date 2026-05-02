import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kami Slides - 智能幻灯片生成",
  description: "输入话题，AI 自动生成专业幻灯片",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
