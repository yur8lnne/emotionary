"use client";

import { useState, useEffect } from "react";
import { Megrim } from "next/font/google";
import { FaCog, FaGripLines } from "react-icons/fa";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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
  const limitedTransform = transform ? { ...transform, x: 0 } : null;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{
        transform: CSS.Transform.toString(limitedTransform),
        transition,
        background: selected ? "#dbeafe" : settingsMode ? "#f0f9ff" : "white",
        padding: "12px",
        borderRadius: "10px",
        border: "1px solid #ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span onClick={onSelect} style={{ flex: 1, cursor: "pointer", userSelect: "none" }}>
        {name}
      </span>
      {settingsMode && (
        <span {...listeners} style={{ cursor: "grab", padding: "0 6px" }}>
          <FaGripLines />
        </span>
      )}
    </div>
  );
}

export default function FriendsPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState("");
  const [settingsMode, setSettingsMode] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  const sensors = useSensors(useSensor(PointerSensor));

  // 친구 목록 불러오기
  const fetchFriends = async () => {
    try {
      const res = await fetch("/api/friends", { method: "GET", credentials: "include" });
      if (res.status === 401) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }
      const data = await res.json();
      setFriends(data.friends || []);
    } catch (err) {
      console.error("친구 목록 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const addFriend = async () => {
    if (!inputValue.trim()) return;
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ friendUserId: inputValue.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "친구 추가 실패"); return; }
      setFriends(data.friends); setInputValue(""); setShowInput(false); setError("");
    } catch (err) { console.error(err); setError("친구 추가 실패 (서버 오류)"); }
  };

  const deleteSelectedFriends = async () => {
    try {
      for (const f of selectedFriends) {
        await fetch(`/api/friends?id=${f}`, { method: "DELETE", credentials: "include" });
      }
      fetchFriends();
      setSelectedFriends([]);
    } catch (err) { console.error(err); alert("친구 삭제 실패"); }
  };

  const toggleSelectFriend = (id: string) => {
    if (selectedFriends.includes(id)) setSelectedFriends(selectedFriends.filter(f => f !== id));
    else setSelectedFriends([...selectedFriends, id]);
  };

  // 드래그 정렬 후 순서 저장
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = friends.indexOf(active.id as string);
    const newIndex = friends.indexOf(over.id as string);
    const newFriends = arrayMove(friends, oldIndex, newIndex);
    setFriends(newFriends);

    try {
      await fetch("/api/friends", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderedFriends: newFriends }),
      });
    } catch (err) { console.error("순서 저장 실패:", err); }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "60px auto", padding: "20px", background: "#f5f5f5", borderRadius: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 className={megrim.className} style={{ fontSize: "32px", fontWeight: 700 }}>FRIENDS</h2>
        <button onClick={() => { if (settingsMode) setSelectedFriends([]); setSettingsMode(!settingsMode); }}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "24px", color: settingsMode ? "#94a3b8" : "#777" }}>
          <FaCog />
        </button>
      </div>

      {selectedFriends.length > 0 && (
        <button onClick={deleteSelectedFriends}
          style={{ width: "100%", padding: "12px", background: "#ef4444", color: "white", borderRadius: "10px", border: "none", cursor: "pointer", marginBottom: "15px" }}>
          선택 친구 삭제
        </button>
      )}

      <button onClick={() => setShowInput(true)}
        style={{ width: "100%", padding: "14px", background: "#94a3b8", color: "white", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "16px", marginBottom: "15px" }}>
        친구 추가하기
      </button>

      {showInput && (
        <div style={{ marginBottom: "20px", padding: "15px", borderRadius: "10px", background: "white", border: "1px solid #ccc" }}>
          <input
            placeholder="친구 아이디 입력 (user.userId)"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "12px" }}
          />
          {error && <p style={{ color: "red", fontSize: "14px", marginBottom: "10px" }}>{error}</p>}
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={addFriend} style={{ flex: 1, padding: "12px", background: "#94a3b8", color: "white", borderRadius: "10px", border: "none", cursor: "pointer" }}>추가</button>
            <button onClick={() => setShowInput(false)} style={{ flex: 1, padding: "12px", background: "#e5e7eb", borderRadius: "10px", border: "none", cursor: "pointer" }}>취소</button>
          </div>
        </div>
      )}

      <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>친구 목록</h3>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={friends} strategy={verticalListSortingStrategy}>
          <ul style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {friends.map(f => (
              <FriendItem key={f} id={f} name={f} selected={selectedFriends.includes(f)} settingsMode={settingsMode} onSelect={() => toggleSelectFriend(f)} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {/* ---------------------------------------------------------------- */}
      {/* 🔙 뒤로가기 버튼 */}
      {/* ---------------------------------------------------------------- */}
      <br></br><br></br>
      <button
        onClick={() => history.back()}
        className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 w-fit"
      >
        ← 달력으로 돌아가기
      </button>

    </div>
  );
}
