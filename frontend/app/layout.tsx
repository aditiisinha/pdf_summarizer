import type { Metadata } from "next";
import { Source_Sans_3 as FontSans} from "next/font/google";
import "./globals.css";

const fontSans = FontSans({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight:["200","300","400","500","600","700","800","900"],
});


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
    <html lang="en">
      <body
        className={`font-sans ${fontSans.variable}  antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
