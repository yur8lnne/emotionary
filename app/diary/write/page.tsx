"use client";

import { useRef, useState, useEffect } from "react";
import { FaCamera } from "react-icons/fa";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

export default function DiaryWrite() {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  let savedRange: Range | null = null;

  /** 날짜 선택 상태 */
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(dayjs()); // 오늘 날짜 기본 선택
  const [current, setCurrent] = useState(dayjs());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null); // hover 상태

  /** 에디터 placeholder 상태 */
  const [editorEmpty, setEditorEmpty] = useState(true);

  /** 달력 데이터 */
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

  /** --------------------
   *   색상 변경 / 사진 첨부
   *  --------------------*/
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRange = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    if (!savedRange) return;
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(savedRange);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    restoreSelection();
    document.execCommand("foreColor", false, e.target.value);
  };

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

  // 처음 마운트 시 placeholder 설정
  useEffect(() => {
    if (editorRef.current && editorEmpty) {
      editorRef.current.innerText = "오늘은 어떤 하루였나요?";
    }
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h2></h2>

      {/* 날짜 선택 input */}
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
              left: 0,
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
              {grid.map((d, i) => (
                <div key={i}>
                  {d ? (
                    <button
                      onClick={() => handleSelect(d)}
                      onMouseEnter={() => setHoveredDay(d)}
                      onMouseLeave={() => setHoveredDay(null)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background:
                          selected?.date() === d && selected.isSame(current, "month")
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
                    <span></span>
                  )}
                </div>
              ))}
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
      />

      {/* 글자색 / 사진 버튼 */}
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
            border: "none",
            borderRadius: "50%",
            padding: 0,
            cursor: "pointer",
            backgroundColor: "currentColor",
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            boxShadow: "none",
          }}
          title="글자 색 변경"
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
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            transition: "all 0.2s",
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
      </div>

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
        onClick={() => alert("작성 완료!")}
      >
        작성 완료
      </button>
    </div>
  );
}
