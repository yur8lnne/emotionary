"use client";

import { useRef, useState, useEffect } from "react";
import { FaCamera } from "react-icons/fa";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function DiaryWrite() {
  const router = useRouter();
  const { data: session } = useSession();
  const editorRef = useRef<HTMLDivElement>(null);
  let savedRange: Range | null = null;

  /** 날짜 선택 상태 */
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(dayjs());
  const [current, setCurrent] = useState(dayjs());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  /** 에디터 placeholder 상태 */
  const [editorEmpty, setEditorEmpty] = useState(true);

  /** 오늘의 이모티콘 상태 */
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const daysInMonth = current.daysInMonth();
  const startDay = current.startOf("month").day();

  const prevMonth = () => setCurrent(current.subtract(1, "month"));
  const nextMonth = () => setCurrent(current.add(1, "month"));

  const handleSelect = (day: number) => {
    const date = current.date(day);
    setSelected(date);
    setOpen(false);
  };

  const grid: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(d);

  /** 커서 저장 & 복구 */
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRange = sel.getRangeAt(0);
  };

  const restoreSelection = () => {
    if (!savedRange) return;
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(savedRange);
  };

  /** 글자색 */
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    restoreSelection();
    document.execCommand("foreColor", false, e.target.value);
  };

  /** 이미지 첨부 */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && editorRef.current) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.src = event.target?.result as string;
        img.style.maxWidth = "100%";
        img.style.display = "block";
        img.style.margin = "8px 0";

        restoreSelection();
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          range.deleteContents();
          range.insertNode(img);
          range.setStartAfter(img);
          range.setEndAfter(img);
          sel.removeAllRanges();
          sel.addRange(range);
        } else {
          editorRef.current.appendChild(img);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  /** 이모티콘 목록 */
  const emojiList = ["🙂", "😂", "😭", "🤔", "😡", "😍", "😴", "👀", "🎉", "❤️", "⭐", "🌸"];

  /** 이모티콘 선택 */
  const selectEmoji = (emoji: string) => {
    setSelectedEmoji(emoji);
    setEmojiOpen(false);
  };

  /** placeholder 초기 설정 */
  useEffect(() => {
    if (editorRef.current && editorEmpty) {
      editorRef.current.innerText = "오늘은 어떤 하루였나요?";
    }
  }, []);

  /** 일기 저장 */
  const handleSubmit = async () => {
    if (!selected) {
      alert("날짜를 선택해주세요!");
      return;
    }

    if (!selectedEmoji) {
      alert("오늘의 이모티콘을 선택해주세요!");
      return;
    }

    const content = editorRef.current?.innerHTML.trim();
    if (!content || content === "" || content === "일기를 작성해보세요...") {
      alert("내용을 입력해주세요!");
      return;
    }

    try {
      const res = await fetch("/api/diary/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          date: selected.format("YYYY-MM-DD"),
          emoji: selectedEmoji,
          userId: session?.user?.id || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`저장 실패: ${data.message}`);
        return;
      }

      alert("일기 저장에 성공했습니다!");
      router.push("/diary");
    } catch (err) {
      console.error(err);
      alert("서버 오류: 저장에 실패했습니다.");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h2>일기 작성</h2>

      {/* 오늘의 이모티콘 표시 */}
      <div style={{ fontSize: 40, textAlign: "center", marginBottom: 16 }}>
        {selectedEmoji || "❓"}
      </div>

      {/* 날짜 선택 */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <input
          type="text"
          readOnly
          value={selected ? selected.format("YYYY-MM-DD") : "년.월.일."}
          onClick={() => setOpen(true)}
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #ccc",
            borderRadius: 6,
            cursor: "pointer",
          }}
        />

        {open && (
          <div
            style={{
              position: "absolute",
              top: 48,
              width: 260,
              background: "white",
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              padding: 16,
              zIndex: 50,
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <button onClick={prevMonth}>◀</button>
              <span>{current.format("YYYY년 M월")}</span>
              <button onClick={nextMonth}>▶</button>
            </div>

            <div className="grid grid-cols-7 text-center text-sm text-gray-600 mb-2">
              {"일월화수목금토".split("").map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 text-center gap-y-2">
              {grid.map((d, i) =>
                d ? (
                  <button
                    key={i}
                    onClick={() => handleSelect(d)}
                    onMouseEnter={() => setHoveredDay(d)}
                    onMouseLeave={() => setHoveredDay(null)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background:
                        selected?.date() === d &&
                        selected.isSame(current, "month")
                          ? "#5aa7ff"
                          : hoveredDay === d
                          ? "#b3d4ff"
                          : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    {d}
                  </button>
                ) : (
                  <div key={i}></div>
                )
              )}
            </div>

            <div className="flex justify-between mt-3 text-sm">
              <button onClick={() => setOpen(false)}>닫기</button>
              <button
                onClick={() => {
                  setSelected(null);
                  setOpen(false);
                }}
              >
                초기화
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 에디터 */}
      <div
        ref={editorRef}
        contentEditable
        onFocus={() => {
          if (editorEmpty && editorRef.current) {
            editorRef.current.innerText = "";
          }
        }}
        onBlur={() => {
          if (editorRef.current && editorRef.current.innerText.trim() === "") {
            editorRef.current.innerText = "일기를 작성해보세요...";
            setEditorEmpty(true);
          } else {
            setEditorEmpty(false);
          }
        }}
        onInput={() => {
          setEditorEmpty(editorRef.current!.innerText.trim() === "");
        }}
        style={{
          minHeight: 240,
          padding: 12,
          borderRadius: 8,
          border: "1px solid #ccc",
          fontSize: 16,
          outline: "none",
          color: editorEmpty ? "#999" : "#000",
        }}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
      />

      {/* 글자색 / 사진 */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 12,
          alignItems: "center",
        }}
      >
        <input
          type="color"
          onMouseDown={(e) => e.preventDefault()}
          onClick={saveSelection}
          onChange={handleColorChange}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            cursor: "pointer",
          }}
        />

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            cursor: "pointer",
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            saveSelection();
          }}
        >
          <FaCamera />
          사진 첨부
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </label>

        {/* 이모티콘 버튼 */}
        <button
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "#fff",
            cursor: "pointer",
          }}
          onClick={() => setEmojiOpen((prev) => !prev)}
        >
          😊 이모티콘 선택
        </button>

        {emojiOpen && (
          <div
            style={{
              position: "absolute",
              marginTop: 60,
              background: "white",
              borderRadius: 8,
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              padding: 12,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              width: 220,
              zIndex: 100,
            }}
          >
            {emojiList.map((emoji) => (
              <button
                key={emoji}
                onClick={() => selectEmoji(emoji)}
                style={{
                  fontSize: 20,
                  padding: 6,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 제출 버튼 */}
      <button
        style={{
          marginTop: 20,
          width: "100%",
          padding: 12,
          backgroundColor: "#635fc7",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 16,
          cursor: "pointer",
        }}
        onClick={handleSubmit}
      >
        작성 완료
      </button>
    </div>
  );
}
