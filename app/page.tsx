import { Megrim } from "next/font/google";

const megrim = Megrim({
  weight: "400",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: "140px" }}>
      <h1
        className={megrim.className}
        style={{ fontSize: "50px", marginBottom: "20px" }}
      >
        emotionary
      </h1>

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
    </div>
  );
}
