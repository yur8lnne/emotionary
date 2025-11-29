"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function PeekFriendSelectPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    async function loadFriends() {
      if (!session?.user) return;

      const res = await fetch(`/api/friends?userId=${session.user.id}`);
      const data = await res.json();
      setFriends(data.friends || []);
    }
    loadFriends();
  }, [session]);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">친구 선택</h2>

      {friends.length === 0 && (
        <p className="text-gray-600">추가된 친구가 없습니다.</p>
      )}

      <div className="flex flex-col gap-3">
        {friends.map((f: any) => (
          <button
            key={f.id}
            onClick={() =>
              router.push(
                `/diary/peek?friendId=${f.friendId}&friendName=${f.friendName}`
              )
            }
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {f.friendName}
          </button>
        ))}
      </div>

      <button
        onClick={() => router.push("/diary/peek")}
        className="mt-6 block w-full px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
      >
        돌아가기
      </button>
    </div>
  );
}
