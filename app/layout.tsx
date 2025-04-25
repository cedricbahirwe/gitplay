import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "../components/SessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GitPlay - GitHub Social Feed",
  description: "View fun, personalized updates about the GitHub users you follow",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          {session && <Navbar />}
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
