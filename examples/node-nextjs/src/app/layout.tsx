import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hosty demo",
  description: "Some description for SEO",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
