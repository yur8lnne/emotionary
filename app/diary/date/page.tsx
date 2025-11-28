"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Diary {
  id: number;
  content: string;
  date: string;
  Emotion: { icon: string }[];
}

export default function DiaryPage() {
  const { date } = useParams();
  const router = useRouter();

  const [diary, setDiary] = useState<Diary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!date) return;

    const fetchDiary = async () => {
      try {
        const res = await fetch(`/api/diary?date=${date}`);
        const data = await res.json();
        if (res.ok) setDiary(data.diary);
        else alert(data.error || "일기 불러오기 실패");
      } catch (err) {
        console.error(err);
        alert("서버 오류: 일기 불러오기 실패");
      } finally {
        setLoading(false);
      }
    };

    fetchDiary();
  }, [date]);

  if (loading) return <div className="p-6">로딩 중...</div>;
  if (!diary) return <div className="p-6">해당 날짜에 작성된 일기가 없습니다.</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{date} 일기</h2>
      {diary.Emotion.length > 0 && <div className="text-4xl mb-4">{diary.Emotion[0].icon}</div>}
      <div
        className="border p-4 rounded-lg whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: diary.content }}
      />
      <button
        onClick={() => router.push("/diary")}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        달력으로 돌아가기
      </button>
    </div>
  );
}
