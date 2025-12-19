import type { Metadata } from "next";
// ❌ 1. 注释掉或删除这行引入
// import { Geist, Geist_Mono } from "next/font/google"; 
import "./globals.css";

// ❌ 2. 注释掉字体配置
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });
// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "123 Studio Souvenir",
  description: "Interactive 3D Badge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      {/* ❌ 3. 把 className 里的字体变量删掉，只保留 antialiased (如果有的话) */}
      {/* <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}> */}
      
      {/* ✅ 改成这样简单粗暴的： */}
      <body style={{ fontFamily: 'sans-serif' }}>
        {children}
      </body>
    </html>
  );
}