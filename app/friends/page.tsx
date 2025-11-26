"use client";

import { useState, useEffect } from "react";
import { Megrim } from "next/font/google";
import { FaCog, FaGripLines } from "react-icons/fa";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragMoveEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const megrim = Megrim({ weight: "400", subsets: ["latin"] });

interface FriendItemProps {
  id: string;
  name: string;
  selected: boolean;
  settingsMode: boolean;
  onSelect: () => void;
}

function FriendItem({ id, name, selected, settingsMode, onSelect }: FriendItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  // 좌우 이동 제한
  const limitedTransform = transform ? { ...transform, x: 0 } : null;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{
        transform: CSS.Transform.toString(limitedTransform),
        transition,
        background: selected
          ? "#dbeafe"
          : settingsMode
          ? "#f0f9ff"
          : "white",
        padding: "12px",
        borderRadius: "10px",
        border: "1px solid #ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span
        onClick={onSelect}
        style={{ flex: 1, cursor: "pointer", userSelect: "none" }}
      >
        {name}
      </span>
      {settingsMode && (
        <span
          {...listeners}
          style={{ cursor: "grab", padding: "0 6px" }}
        >
          <FaGripLines />
        </span>
      )}
    </div>
  );
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState("");
  const [settingsMode, setSettingsMode] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  const sensors = useSensors(useSensor(PointerSensor));

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

  const deleteSelectedFriends = async () => {
    for (const f of selectedFriends) {
      await fetch(`/api/friends?id=${f}`, { method: "DELETE" });
    }
    setFriends(friends.filter((f) => !selectedFriends.includes(f)));
    setSelectedFriends([]);
  };

  const toggleSelectFriend = (id: string) => {
    if (selectedFriends.includes(id)) {
      setSelectedFriends(selectedFriends.filter((f) => f !== id));
    } else {
      setSelectedFriends([...selectedFriends, id]);
    }
  };

  // 드래그 끝났을 때 순서 적용
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = friends.indexOf(active.id as string);
    const newIndex = friends.indexOf(over.id as string);

    // 최상단/최하단 이상 이동 방지
    const limitedIndex = Math.max(0, Math.min(friends.length - 1, newIndex));

    setFriends(arrayMove(friends, oldIndex, limitedIndex));
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "60px auto",
        padding: "20px",
        background: "#f5f5f5",
        borderRadius: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 className={megrim.className} style={{ fontSize: "32px", fontWeight: 700 }}>
          FRIENDS
        </h2>
        <button
          onClick={() => setSettingsMode(!settingsMode)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "24px",
            color: settingsMode ? "#94a3b8" : "#777",
          }}
        >
          <FaCog />
        </button>
      </div>

      {selectedFriends.length > 0 && (
        <button
          onClick={deleteSelectedFriends}
          style={{
            width: "100%",
            padding: "12px",
            background: "#ef4444",
            color: "white",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            marginBottom: "15px",
          }}
        >
          선택 친구 삭제
        </button>
      )}

      <button
        onClick={() => setShowInput(true)}
        style={{
          width: "100%",
          padding: "14px",
          background: "#94a3b8",
          color: "white",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
          marginBottom: "15px",
        }}
      >
        친구 추가하기
      </button>

      {showInput && (
        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            borderRadius: "10px",
            background: "white",
            border: "1px solid #ccc",
          }}
        >
          <input
            placeholder="친구 아이디 입력 (user.userId)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              marginBottom: "12px",
            }}
          />
          {error && (
            <p style={{ color: "red", fontSize: "14px", marginBottom: "10px" }}>{error}</p>
          )}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={addFriend}
              style={{
                flex: 1,
                padding: "12px",
                background: "#94a3b8",
                color: "white",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
              }}
            >
              추가
            </button>
            <button
              onClick={() => setShowInput(false)}
              style={{
                flex: 1,
                padding: "12px",
                background: "#e5e7eb",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>친구 목록</h3>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={friends} strategy={verticalListSortingStrategy}>
          <ul style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {friends.map((f) => (
              <FriendItem
                key={f}
                id={f}
                name={f}
                selected={selectedFriends.includes(f)}
                settingsMode={settingsMode}
                onSelect={() => toggleSelectFriend(f)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
