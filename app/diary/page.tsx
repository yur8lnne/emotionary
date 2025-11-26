"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DiaryCalendarPage() {
  const router = useRouter();
  const [tab, setTab] = useState("friends");

  const tabs = [
    { key: "friends", label: "with friends" },
    { key: "peek", label: "peek only" },
    { key: "private", label: "private" },
  ];

  return (
    <div className="flex flex-col items-center w-full p-6">
      <h2 className="text-3xl mb-4 font-[Megrim] megrim-bold">CALENDER</h2>

      {/* Friends Button */}
      <button
        onClick={() => router.push("/friends")}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600"
      >
        친구 목록 보기
      </button>

      {/* Tabs */}
      <div className="grid grid-cols-3 w-full max-w-md text-center rounded-lg overflow-hidden border border-gray-300">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`py-3 text-l font-[Megrim] megrim-bold transition-all ${
              tab === t.key ? "bg-gray-200" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Calendar container */}
      <div className="mt-6 bg-[#2b2b2b] text-white p-6 rounded-xl shadow-md w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">2025년 11월</span>
          <div className="flex gap-2">
            <span className="cursor-pointer select-none">▲</span>
            <span className="cursor-pointer select-none">▼</span>
          </div>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 text-center text-sm mb-3 text-gray-300">
          {"일월화수목금토".split("").map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 text-center text-sm gap-y-3">
          {[26,27,28,29,30,31,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30].map((d, i) => {
            const isThisMonth = i >= 6 && i <= 35;
            const isToday = d === 15 && isThisMonth;

            return (
              <div
                key={i}
                onClick={() => isThisMonth && router.push(`/diary/2025-11-${d}`)}
                className={`w-8 h-8 flex items-center justify-center mx-auto rounded-full cursor-pointer transition-all
                  ${isThisMonth ? "text-white" : "text-gray-500"}
                  ${isToday ? "bg-sky-400 text-black font-bold" : "hover:bg-gray-600"}`}
              >
                {d}
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => router.push("/diary/write")}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600"
      >
        새 일기 쓰기
      </button>
    </div>
  );
}
