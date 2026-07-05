import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog  — Burhan",
  description: "Thoughts and writing by Burhan.",
};

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>{children}</div>;
}