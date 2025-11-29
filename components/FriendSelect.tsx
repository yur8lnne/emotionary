// components/FriendSelect.tsx
"use client";

import { useEffect, useState } from "react";

export default function FriendSelect({ selectedFriend, setSelectedFriend }: any) {
  const [friends, setFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFriends() {
      try {
        const res = await fetch("/api/friends");
        const data = await res.json();
        setFriends(data.friends || []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchFriends();
  }, []);

  if (loading) return <div>친구 목록 불러오는 중...</div>;
  if (friends.length === 0)
    return <div className="text-gray-500">아직 친구가 없습니다</div>;

  return (
    <select
      className="border rounded px-2 py-1"
      value={selectedFriend}
      onChange={(e) => setSelectedFriend(e.target.value)}
    >
      <option value="">친구 선택 (선택 안함)</option>

      {friends.map((f) => (
        <option key={f} value={f}>
          {f}
        </option>
      ))}
    </select>
  );
}
