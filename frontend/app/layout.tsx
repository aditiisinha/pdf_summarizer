import type { Metadata } from "next";
import { Source_Sans_3 as FontSans} from "next/font/google";
import "./globals.css";
import Header from '@/components/common/header';
import Footer from '@/components/common/footer';
import { ClerkProvider } from "@clerk/nextjs";
const fontSans = FontSans({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight:["200","300","400","500","600","700","800","900"],
});

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable. " +
    "Please set it in your .env.local file. " +
    "Get your keys from https://dashboard.clerk.com"
  );
}


export const metadata: Metadata = {
  title: "Summarium-AI Powered PDF Summarizer",
  description: "It saves hours of redaing time by generating accurate and concise summaries. Upload your PDF files and get summaries in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
    <html lang="en">
      <body
        className={`font-sans ${fontSans.variable}  antialiased`}
      >
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
    </ClerkProvider>
  );
}
