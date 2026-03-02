import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "موسوعة حساب التفاضل والتكامل",
  description: "الشرح الأشمل بالعربية — كل مفهوم، كل حالة، كل تقنية، مع أمثلة محلولة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Amiri:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Cairo', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
