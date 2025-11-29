"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DiaryDetailPage() {
  const router = useRouter();
  const { date } = useParams(); // 예: "2025-11-28"
  const [diary, setDiary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!date) return;

    async function fetchDiary() {
      try {
        const res = await fetch(`/api/diary?date=${date}`);
        const data = await res.json();
        setDiary(data.diary);
        setLoading(false);
      } catch (e) {
        console.error(e);
      }
    }

    fetchDiary();
  }, [date]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6">{date}의 일기</h1>

      {!diary ? (
        <div className="mt-6">
          <p className="text-gray-700">이 날짜에는 작성된 일기가 없습니다.</p>

          <button
            onClick={() => router.push(`/diary/write?date=${date}`)}
            className="mt-4 px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
          >
            이 날짜에 일기 쓰기
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-8">

          {/* ---------------------------------------------------------------- */}
          {/* ✅ 선택된 감정(이모지) 1개만 보여주기 */}
          {/* ---------------------------------------------------------------- */}
          <div>
            <h2 className="text-xl font-semibold mb-3">오늘의 감정</h2>

            {diary.emoji ? (
              <div className="text-4xl px-4 py-2 rounded-full bg-yellow-200 w-fit border border-yellow-400">
                {diary.emoji}
              </div>
            ) : (
              <span className="text-gray-500">선택한 감정이 없습니다</span>
            )}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* ✅ 선택한 친구 보여주기 */}
          {/* ---------------------------------------------------------------- */}
          <div>
            <h2 className="text-xl font-semibold mb-3">함께한 친구</h2>

            {diary.friendUserId ? (
              <div className="px-4 py-2 rounded-lg bg-blue-100 border border-blue-300 text-lg">
                {diary.friendUserId}
              </div>
            ) : (
              <span className="text-gray-500">선택한 친구가 없습니다</span>
            )}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* ✅ 일기 내용 */}
          {/* ---------------------------------------------------------------- */}
          <div>
            <h2 className="text-xl font-semibold mb-3">일기 내용</h2>

            <div className="border border-gray-300 rounded-lg p-4 whitespace-pre-wrap bg-white leading-relaxed">
              {diary.content}
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* 🔙 뒤로가기 버튼 */}
          {/* ---------------------------------------------------------------- */}
          <button
            onClick={() => router.push("/diary")}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 w-fit"
          >
            ← 달력으로 돌아가기
          </button>
        </div>
      )}
    </div>
  );
}
