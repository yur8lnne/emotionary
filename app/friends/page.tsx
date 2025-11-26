"use client";

import { useState, useEffect } from "react";

export default function FriendsPage() {
  const [friends, setFriends] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/friends")
      .then((res) => res.json())
      .then((data) => setFriends(data.friends || []));
  }, []);

  const addFriend = async () => {
    if (!inputValue.trim()) return;

    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendUserId: inputValue.trim() }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "친구 추가 실패");
      return;
    }

    setFriends(data.friends);
    setError("");
    setInputValue("");
    setShowInput(false);
  };

  const deleteFriend = async (id: string) => {
    const res = await fetch(`/api/friends?id=${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    setFriends(data.friends);
  };

  return (
    <div className="w-full p-6 max-w-md mx-auto">
      <h2 className="text-3xl mb-4 text-center">Friends</h2>

      <button
        onClick={() => setShowInput(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded w-full"
      >
        친구 추가하기
      </button>

      {showInput && (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <input
            className="w-full p-2 mb-3 border rounded"
            placeholder="친구 아이디 입력 (user.userId)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <div className="flex gap-2">
            <button
              className="flex-1 py-2 bg-green-500 text-white rounded"
              onClick={addFriend}
            >
              추가
            </button>
            <button
              className="flex-1 py-2 bg-gray-400 text-white rounded"
              onClick={() => setShowInput(false)}
            >
              취소
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-xl mb-2">친구 목록</h3>
        {friends.length === 0 ? (
          <p className="text-gray-500 text-sm">아직 친구가 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {friends.map((f) => (
              <li
                key={f}
                className="p-3 border rounded bg-white flex justify-between"
              >
                <span>{f}</span>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                  onClick={() => deleteFriend(f)}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
