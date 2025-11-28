"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Megrim } from "next/font/google";
import { signIn } from "next-auth/react";

const megrim = Megrim({ weight: "400", subsets: ["latin"] });

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    if (!userId || !password) {
      alert("ID와 비밀번호를 입력해주세요.");
      return;
    }

    try {
      /*
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // 간단하게 localStorage에 저장
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("로그인 성공!");
        router.push("/diary"); // 로그인 후 달력 페이지로 이동
      } else {
        alert(data.message || "로그인 실패");
      }
      */
      const result = await signIn("credentials", {
        redirect: false,
        userId,
        password,
      });

      if (result?.error) {
        alert("로그인 실패: " + result.error);
      } else {
        alert("로그인 성공!");
        router.push("/diary"); // 로그인 후 달력 페이지로 이동
      }
    } catch (err) {
      console.error(err);
      alert("로그인 중 오류 발생");
    }
  };

  const goToRegister = () => router.push("/register");

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "60px auto",
        textAlign: "center",
        padding: "20px",
        background: "#f5f5f5",
        borderRadius: "12px",
      }}
    >
      <h1 className={megrim.className} style={{ fontSize: "32px", marginBottom: "30px" }}>
        EMOTIONARY
      </h1>

      <input
        type="text"
        placeholder="ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "15px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "25px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={handleSignIn}
        style={{
          width: "100%",
          padding: "14px",
          background: "#94a3b8",
          color: "white",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          marginBottom: "35px",
          fontSize: "16px",
        }}
      >
        Sign in
      </button>

      <p style={{ marginBottom: "25px", color: "#777" }}>
        ----------------- Don't have an account? -----------------
      </p>

      <button
        onClick={goToRegister}
        style={{
          width: "100%",
          padding: "14px",
          background: "#e5e7eb",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Create an Account
      </button>
    </div>
  );
}
