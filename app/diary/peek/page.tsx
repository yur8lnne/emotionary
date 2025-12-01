"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function DiaryPeekPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // 선택된 친구
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [selectedFriendUserId, setSelectedFriendUserId] = useState<string | null>(null);
  const [selectedFriendName, setSelectedFriendName] = useState<string | null>(null);

  // 드롭다운 열림 여부
  const [friendDropdownOpen, setFriendDropdownOpen] = useState(false);

  // 친구 목록
  const [friends, setFriends] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  // 탭
  const [tab, setTab] = useState("peek");
  const [yearModalOpen, setYearModalOpen] = useState(false);
  const [noDiaryModal, setNoDiaryModal] = useState(false);

  // 현재 날짜 계산
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

  // URL 파라미터에서 친구 정보 가져오기
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const friendId = params.get("friendId");
    const friendUserId = params.get("friendUserId");
    const friendName = params.get("friendName");

    if (friendId) setSelectedFriendId(friendId);
    if (friendUserId) setSelectedFriendUserId(friendUserId);
    if (friendName) setSelectedFriendName(decodeURIComponent(friendName));
  }, []);

  // 🔥 친구 목록 가져오기
  useEffect(() => {
    async function fetchFriends() {
      try {
        const res = await fetch("/api/friends?type=detailed");
        const data = await res.json();
        setFriends(data.friends || []);
        setLoadingFriends(false);
      } catch (err) {
        console.error(err);
        setLoadingFriends(false);
      }
    }

    fetchFriends();
  }, []);

  // 이전/다음달 이동
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

  // 날짜 클릭 → 친구 일기 확인
  const handleDayClick = async (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth || !selectedFriendId) return;

    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    try {
      const res = await fetch(
        `/api/diary?date=${dateStr}&friendUserId=${selectedFriendId}`,
        { method: "GET" }
      );
      const data = await res.json();

      if (data?.diary) {
        router.push(`/diary/peek/${dateStr}?userId=${selectedFriendId}`);
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

      {/* 로그인 정보 */}
      {session?.user && (
        <div className="flex justify-between items-center mb-4 w-full max-w-md">
          <div className="flex items-center gap-3">
            <img
              src="https://i.imgur.com/2yaf2wb.png"
              alt="profile"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-lg font-medium">{session.user.userId}님</span>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-3 py-1 bg-[#94a3b8] text-white rounded hover:bg-[#7e8ea0] transition"
          >
            로그아웃
          </button>
        </div>
      )}

      {/* 탭 */}
      <div className="grid grid-cols-2 w-full max-w-md text-center rounded-lg overflow-hidden border border-gray-300 mb-6">
        {[
          { key: "peek", label: "peek only" },
          { key: "private", label: "private" },
        ].map((t) => (
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

      {/* 🔥 친구 선택 드롭다운 */}
      <div className="w-full max-w-md mb-4 relative">
        <button
          onClick={() => setFriendDropdownOpen(!friendDropdownOpen)}
          className="w-full px-4 py-2 bg-gray-200 rounded-lg text-lg font-medium hover:bg-gray-300 transition"
        >
          {selectedFriendUserId
            ? `${selectedFriendUserId}님의 달력`
            : "친구 선택하기"}
        </button>

        {/* 드롭다운 목록 */}
        {friendDropdownOpen && (
          <div className="absolute mt-2 w-full bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {loadingFriends ? (
              <div className="p-3 text-gray-600 text-center">불러오는 중…</div>
            ) : friends.length === 0 ? (
              <div className="p-3 text-gray-600 text-center">
                아직 친구가 없습니다
              </div>
            ) : (
              friends.map((f) => (
                <div
                  key={f.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setFriendDropdownOpen(false);
                    setSelectedFriendUserId(f.friendId);
                    setSelectedFriendName(f.friendName);
                    setSelectedFriendId(f.id);
                    router.push(
                      `/diary/peek?friendId=${f.id}&friendUserId=${f.friendId}&friendName=${encodeURIComponent(
                        f.friendName
                      )}`
                    );
                  }}
                >
                  {f.friendId} { f.friendName ? "(" + f.friendName + ")" : ""}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 달력 UI */}
      <div className="mt-3 bg-[#2b2b2b] text-white p-6 rounded-xl shadow-md w-full max-w-md">
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

      {/* 친구 목록 페이지로 이동 */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full max-w-md justify-center">
        <button
          onClick={() => router.push("/friends")}
          className="flex-1 px-4 py-2 bg-[#94a3b8] text-white rounded-md shadow hover:bg-[#7e8ea0] transition-colors"
        >
          친구 목록 보기
        </button>
      </div>

      {/* 연도/월 선택 모달 */}
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

      {/* 일기 없음 모달 */}
      {noDiaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-64 text-center">
            <p className="text-lg font-semibold text-black">
              일기가 아직 없습니다!
            </p>
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
