import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SDP Machines",
  description: "Quotation Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}