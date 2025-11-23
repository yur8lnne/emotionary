export default function DiaryWrite() {
  return (
    <div>
      <h2>일기 작성</h2>

      <textarea
        placeholder="오늘은 어떤날이었나요?"
        style={{
          width: "100%",
          minHeight: "240px",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      <button style={{ marginTop: 20, padding: 10 }}>작성 완료</button>
    </div>
  );
}
