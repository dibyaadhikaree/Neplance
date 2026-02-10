import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/shared/context/AuthContext";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata = {
  title: "Neplance",
  description: "Connect with world-class talent. Build remarkable projects.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><polygon points='100,30 60,140 140,140' fill='white'/><polygon points='60,140 40,140 70,90' fill='%23a1a1aa'/><polygon points='140,140 160,140 130,90' fill='%2371717a'/></svg>",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className={geist.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
