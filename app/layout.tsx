import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "河狸师兄 - AI智能幻灯片生成",
  description: "输入话题，AI自动生成专业幻灯片，分钟级完成",
  keywords: ["AI", "幻灯片", "PPT", "自动生成", "演示文稿"],
  authors: [{ name: "河狸师兄" }],
  openGraph: {
    title: "河狸师兄 - AI智能幻灯片生成",
    description: "输入话题，AI自动生成专业幻灯片",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full" suppressHydrationWarning>
      <head>
        {/* Font: 阿里巴巴普惠体 */}
        <link rel="preconnect" href="https://fonts.alicdn.com" />
        <link
          href="https://fonts.alicdn.com/css?family=Alibaba-PuHuiTi:400,500,600,700&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --font-sans: "Alibaba PuHuiTi", "Alibaba-PuHuiTi", "PingFang SC", "Microsoft YaHei", system-ui, -apple-system, sans-serif;
            --font-display: "Alibaba PuHuiTi", "Alibaba-PuHuiTi", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
            --font-mono: ui-monospace, SFMono-Regular, monospace;
          }
        `}} />
        {/* Theme Script - Prevent Flash */}
        <script id="theme-init" dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme');
              var resolved = 'light';
              if (theme === 'dark') {
                resolved = 'dark';
              } else if (theme === 'light') {
                resolved = 'light';
              } else {
                resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              }
              document.documentElement.classList.add(resolved);
            } catch (e) {}
          })();
        `}} />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
