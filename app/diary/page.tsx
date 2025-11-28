"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function DiaryPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [tab, setTab] = useState("private");
  const [yearModalOpen, setYearModalOpen] = useState(false);
  const [noDiaryModal, setNoDiaryModal] = useState(false);

  // 탭 순서 고정: 왼쪽 peek, 오른쪽 private
  const tabs = [
    { key: "peek", label: "peek only" },
    { key: "private", label: "private" },
  ];

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  const [year, setYear] = useState(todayYear);
  const [month, setMonth] = useState(todayMonth);

  const years = Array.from({ length: 20 }, (_, i) => todayYear - 10 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const calendarDays: { day: number; isCurrentMonth: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({ day: d, isCurrentMonth: true });
  }
  while (calendarDays.length < 42) {
    calendarDays.push({
      day: calendarDays.length - daysInMonth - firstDay + 1,
      isCurrentMonth: false,
    });
  }

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else setMonth(month + 1);
  };

  const handleDayClick = async (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth || !session?.user) return;

    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    try {
      const res = await fetch(
        `/api/diary?date=${dateStr}&userId=${session.user.id}`,
        { method: "GET" }
      );
      const data = await res.json();

      if (data?.diary) {
        router.push(`/diary/${dateStr}`);
      } else {
        setNoDiaryModal(true);
      }
    } catch (err) {
      console.error(err);
      setNoDiaryModal(true);
    }
  };

  return (
    <div className="flex flex-col items-center w-full p-6 relative">
      <h2 className="text-3xl mb-4 font-[Megrim] megrim-bold">CALENDAR</h2>

      {/* 로그인 상태 표시 + 로그아웃 */}
      {session?.user && (
        <div className="flex justify-between items-center mb-4 w-full max-w-md">
          {/* 좌측: 프로필 이미지 + 아이디 */}
          <div className="flex items-center gap-3">
            <img
              src="https://i.imgur.com/2yaf2wb.png" // Smiley face
              alt="profile"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-lg font-medium">{session.user.userId}님</span>
          </div>

          {/* 우측: 로그아웃 버튼 */}
          <button
            onClick={() => signOut({ redirect: false, callbackUrl: "/" })}
            className="px-3 py-1 bg-[#94a3b8] text-white rounded hover:bg-[#7e8ea0] transition"
          >
            로그아웃
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="grid grid-cols-2 w-full max-w-md text-center rounded-lg overflow-hidden border border-gray-300 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              router.push(t.key === "peek" ? "/diary/peek" : "/diary");
            }}
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
          <div
            onClick={() => setYearModalOpen(true)}
            className="flex gap-2 cursor-pointer select-none"
          >
            <span className="text-lg font-semibold">{year}년</span>
            <span className="text-lg font-semibold">{month + 1}월</span>
          </div>
          <div className="flex gap-2">
            <span
              onClick={prevMonth}
              className="cursor-pointer select-none text-lg font-bold"
            >
              ▲
            </span>
            <span
              onClick={nextMonth}
              className="cursor-pointer select-none text-lg font-bold"
            >
              ▼
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center text-sm mb-3 text-gray-300">
          {"일월화수목금토".split("").map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 text-center text-sm gap-y-3">
          {calendarDays.map(({ day, isCurrentMonth }, idx) => {
            const isToday =
              isCurrentMonth &&
              day === todayDate &&
              month === todayMonth &&
              year === todayYear;

            return (
              <div
                key={idx}
                onClick={() => handleDayClick(day, isCurrentMonth)}
                className={`w-8 h-8 flex items-center justify-center mx-auto rounded-full cursor-pointer transition-all
                  ${isCurrentMonth ? "text-white" : "text-gray-500"}
                  ${isToday ? "bg-sky-400 text-black font-bold" : "hover:bg-gray-600"}
                `}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full max-w-md justify-center">
        <button
          onClick={() => router.push("/friends")}
          className="flex-1 px-4 py-2 bg-[#94a3b8] text-white rounded-md shadow hover:bg-[#7e8ea0] transition-colors"
        >
          친구 목록 보기
        </button>

        <button
          onClick={() => router.push("/diary/write")}
          className="flex-1 px-4 py-2 bg-[#94a3b8] text-white rounded-md shadow hover:bg-[#7e8ea0] transition-colors"
        >
          새 일기 쓰기
        </button>
      </div>

      {/* Year/Month Modal */}
      {yearModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-64 flex flex-col items-center gap-4">
            <h3 className="text-lg font-semibold">연도와 월 선택</h3>
            <div className="flex gap-4 w-full justify-center overflow-x-auto">
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="text-black p-2 rounded-md"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}년
                  </option>
                ))}
              </select>

              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="text-black p-2 rounded-md"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m + 1}월
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 mt-4">
              <button
                onClick={() => setYearModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                취소
              </button>

              <button
                onClick={() => setYearModalOpen(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 일기 없는 날 모달 */}
      {noDiaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-64 text-center">
            <p className="text-lg font-semibold text-black">일기가 아직 없습니다!</p>
            <button
              onClick={() => setNoDiaryModal(false)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
