import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import { AppProvider } from "@/context/AppContext";
import { SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "The Reading Retreat",
  description: "A calm place to read, write, and save thoughtful blogs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <AppProvider>
          <Navbar />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
