import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EvFindOrigin",
  description: "Telegram-бот для поиска источников информации",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
