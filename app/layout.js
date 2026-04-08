import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "LogicEye VMS Installation Tracker",
  description: "Track LogicEye VMS installation health, camera details, and live ping status.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-gray-950 font-sans text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}
