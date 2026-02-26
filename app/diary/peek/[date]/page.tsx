"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function DiaryDetailPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { date } = useParams(); // URL에서 2025-11-28 가져오기
  const [diary, setDiary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getFriendQuery = () => {
    const params = new URLSearchParams(window.location.search);
    const friendId = params.get("friendId") ?? params.get("userId");
    const friendUserId = params.get("friendUserId");
    const friendName = params.get("friendName");
    return { friendId, friendUserId, friendName };
  };

  useEffect(() => {
    if (!date) return;

    async function fetchDiary() {
      try {
        const { friendId } = getFriendQuery();

        const res = await fetch(`/api/diary?date=${date}&friendUserId=${friendId}`, { method: "GET" });
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
    return <p style={{ padding: "20px" }}>불러오는 중...</p>;
  }

  const handleLikeClick = async () => {
    if (!session?.user?.id) return;
    
    try {
      const res = await fetch(`/api/diaryLike`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          diaryId: diary.id,
          userId: session.user.id,
        }),
      });
      const data = await res.json();
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBackToCalendar = () => {
    const { friendId, friendUserId, friendName } = getFriendQuery();

    if (!friendId) {
      router.push("/diary/peek");
      return;
    }

    const qs = new URLSearchParams();
    qs.set("friendId", friendId);
    if (friendUserId) qs.set("friendUserId", friendUserId);
    if (friendName) qs.set("friendName", friendName);

    router.push(`/diary/peek?${qs.toString()}`);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>
        📘 {date}의 일기
      </h2>

      {/* 일기가 없는 경우 */}
      {!diary ? (
        <div>
          <p>이 날짜에는 작성된 일기가 없습니다.</p>
          <button
            onClick={() => router.push(`/diary/write?date=${date}`)}
            style={{
              padding: "10px 15px",
              borderRadius: "6px",
              background: "#1976d2",
              color: "white",
              border: "none",
              marginTop: "12px",
            }}
          >
            이 날짜에 일기 쓰러 가기
          </button>
        </div>
      ) : (
        <div>
          {/* 감정(이모티콘) */}
          {diary.emotions && diary.emotions.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3>오늘의 감정</h3>
              <div style={{ fontSize: "32px" }}>
                {diary.emotions.map((emo: any) => (
                  <span key={emo.id}>{emo.icon}</span>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              marginTop: "10px",
            }}
            dangerouslySetInnerHTML={{ __html: diary.content }}
          /><br></br><br></br>

          {/* ---------------------------------------------------------------- */}
          {/* ✅ 좋아요 */}
          {/* ---------------------------------------------------------------- */}
          <div>
            <h2 className="text-xl font-semibold mb-3">좋아요</h2>

            <span>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLikeClick(); }}>
                {session?.user?.id && diary?.likes?.some((like: any) => 
                  Number(like.userId) === Number(session.user.id) && Number(like.diaryId) === Number(diary.id)
                ) ? '❤️' : '♡'}
              </a>
              {' '}{diary.likes.length}명이 좋아합니다.
            </span>
          </div>

          <button
            onClick={handleBackToCalendar}
            style={{
              padding: "10px 15px",
              borderRadius: "6px",
              background: "#444",
              color: "white",
              border: "none",
              marginTop: "20px",
            }}
          >
            ← 달력으로 돌아가기
          </button>
        </div>
      )}
    </div>
  );
}
