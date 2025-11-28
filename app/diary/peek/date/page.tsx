"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface FriendDiary {
  id: number;
  content: string;
  date: string;
  user: { name: string };
  Emotion: { icon: string }[];
}

export default function PeekDiaryPage() {
  const { date } = useParams();
  const router = useRouter();

  const [diaries, setDiaries] = useState<FriendDiary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!date) return;

    const fetchDiaries = async () => {
      try {
        const res = await fetch(`/api/diary/peek?date=${date}`);
        const data = await res.json();
        if (res.ok) setDiaries(data.diary);
        else alert(data.error || "친구 일기 불러오기 실패");
      } catch (err) {
        console.error(err);
        alert("서버 오류: 친구 일기 불러오기 실패");
      } finally {
        setLoading(false);
      }
    };

    fetchDiaries();
  }, [date]);

  if (loading) return <div className="p-6">로딩 중...</div>;
  if (diaries.length === 0) return <div className="p-6">해당 날짜에 친구가 작성한 일기가 없습니다.</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{date} 친구 일기</h2>
      {diaries.map((d) => (
        <div key={d.id} className="border p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">{d.user.name}</span>
            {d.Emotion.length > 0 && <span className="text-3xl">{d.Emotion[0].icon}</span>}
          </div>
          <div dangerouslySetInnerHTML={{ __html: d.content }} className="whitespace-pre-wrap" />
        </div>
      ))}
      <button
        onClick={() => router.push("/diary/peek")}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        달력으로 돌아가기
      </button>
    </div>
  );
}
