"use client"
import React, { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        userId: "",
        password: "",
        confirmPassword: "",
        name: "",
        email: "",
        phone: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

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

        const data = await res.json();
        alert(data.message || "회원가입 요청 완료!");
    };

    return (
        <div className="w-full flex justify-center py-10 min-h-screen">
            <div className="w-full max-w-md rounded-xl p-8 shadow-sm bg-[#f5f5f5]">
                <h1 className="text-xl mb-6 text-gray-600 font-semibold">SIGN UP</h1>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">User ID <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="userId"
                            value={formData.userId}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">Password <span className="text-red-500">*</span></label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">Confirm Password <span className="text-red-500">*</span></label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg bg-white"
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
                        className="mt-6 w-full py-3 rounded-lg bg-slate-400 text-white font-medium hover:bg-slate-500 transition"
                    >
                        Create An Account
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
