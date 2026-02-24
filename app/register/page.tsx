"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    confirmPassword: "",
    name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: formData.userId,
          password: formData.password,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      // ✅ Express에서 400/409 같은 에러도 JSON으로 오므로 처리
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.message || `회원가입 실패 (status: ${res.status})`);
        return;
      }

      alert(data?.message || "회원가입 성공!");
      router.push("/login"); // 성공 시 로그인 페이지로 이동(원하면 제거 가능)
    } catch (err) {
      console.error(err);
      alert("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center py-10 min-h-screen">
      <div className="w-full max-w-md rounded-xl p-8 shadow-sm bg-[#f5f5f5]">
        <h1 className="text-xl mb-6 text-gray-600 font-semibold">SIGN UP</h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              User ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              required
            />
          </div>

          <div className="flex flex-col gap-1 mt-4">
            <label className="text-sm font-medium">User name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Phone number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-3 rounded-lg bg-slate-400 text-white font-medium hover:bg-slate-500 transition disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create An Account"}
          </button>
        </form>

        <div className="text-center mt-4 text-sm">
          <Link href="/login" className="text-gray-600 hover:underline">
            이미 계정이 있으신가요? 로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
