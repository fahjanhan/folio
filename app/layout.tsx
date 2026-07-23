import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "./components/ThemeProvider";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scribes — Burhan",
  description: "I write about technology and life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var stored = null;
                try {
                  stored = localStorage.getItem("theme");
                } catch (e) {}

                var validThemes = ["light", "dark", "warm-light", "warm-dark"];
                var theme = stored && validThemes.indexOf(stored) !== -1 ? stored : null;

                if (!theme) {
                  try {
                    theme = window.matchMedia("(prefers-color-scheme: dark)").matches
                      ? "dark"
                      : "light";
                  } catch (e) {
                    theme = "light";
                  }
                }

                var isDark = theme === "dark" || theme === "warm-dark";

                try {
                  document.documentElement.setAttribute("data-theme", theme);
                  document.documentElement.classList.toggle("dark", isDark);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${poppins.variable} ${geistMono.variable} min-h-screen flex flex-col antialiased`}>
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}