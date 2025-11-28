"use client";

import { Megrim } from "next/font/google";
import { useSession } from "next-auth/react";

const megrim = Megrim({
  weight: "400",
  subsets: ["latin"],
});

export default function Home() {
  const { data: session } = useSession();

  return (
    <div style={{ textAlign: "center", marginTop: "140px" }}>
      <h1
        className={megrim.className}
        style={{ fontSize: "50px", marginBottom: "20px" }}
      >
        emotionary
      </h1>

    {
      (session && session.user) ? (      
      <a
        href="/diary"
        style={{
          padding: "12px 20px",
          background: "#ddd",
          borderRadius: "8px",
          display: "inline-block",
        }}
      >
        달력으로 가기
      </a>
      ) : (
      <a
        href="/login"
        style={{
          padding: "12px 20px",
          background: "#ddd",
          borderRadius: "8px",
          display: "inline-block",
        }}
      >
        로그인
      </a>
      )
    }
    </div>
  );
}
