import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { Shell } from "@/components/ui/Shell";

export const metadata: Metadata = {
  title: "Canton MVP",
  description: "Reference frontend for Canton app builders",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            <Shell>{children}</Shell>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
