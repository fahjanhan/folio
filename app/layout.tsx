import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "./components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Burhan Amjad — Computer Scientist & Designer",
  description: "Computer scientist & designer focused on functional software & hardware.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var stored = null;
                try {
                  stored = localStorage.getItem("theme");
                } catch (e) {}

                var isDark = false;
                try {
                  isDark =
                    stored === "dark" ||
                    (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
                } catch (e) {
                  isDark = false;
                }

                try {
                  document.documentElement.classList.toggle("dark", isDark);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col antialiased`}>
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}