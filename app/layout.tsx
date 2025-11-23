"use client";

import "./globals.css";
import Link from "next/link";
import { Megrim } from "next/font/google";
import { usePathname } from "next/navigation";

// Megrim font
const megrim = Megrim({
  weight: "400",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 홈('/')에서는 헤더 숨기기
  const hideHeader = pathname === "/";

  return (
    <html lang="ko">
      <body>
        {!hideHeader && (
          <header
            style={{
              padding: "16px",
              borderBottom: "1px solid #ccc",
            }}
          >
            <Link
              href="/"
              className={`${megrim.className} megrim-bold`}
              style={{ fontSize: "32px" }}
            >
              emotionary
            </Link>

          </header>
        )}

        <main style={{ padding: "16px" }}>{children}</main>
      </body>
    </html>
  );
}
