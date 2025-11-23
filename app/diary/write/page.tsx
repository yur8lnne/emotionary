"use client";

import { useRef } from "react";
import { FaCamera } from "react-icons/fa";

export default function DiaryWrite() {
const editorRef = useRef<HTMLDivElement>(null);
let savedRange: Range | null = null;

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

return (
<div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}> <h2>일기 작성</h2>


  <div
    ref={editorRef}
    contentEditable
    style={{
      minHeight: 240,
      padding: 12,
      borderRadius: 8,
      border: "1px solid #ccc",
      fontSize: 16,
      outline: "none",
    }}
  />

  <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "center" }}>
    {/* 글자색 버튼 */}
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

    {/* 사진 첨부 버튼 */}
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
        e.preventDefault(); // 버튼 클릭 시 포커스 이동 방지
        saveSelection(); // 현재 커서 위치 저장
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
