"use client";

import { useRouter } from "next/navigation";
import { Megrim } from "next/font/google";

const megrim = Megrim({
  weight: "400",
  subsets: ["latin"],
});

export default function LoginPage() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/diary");
  };

  const goToRegister = () => {
    router.push("/register");
  };

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
