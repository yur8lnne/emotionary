export default function DiaryEdit({ params }: { params: { date: string } }) {
  return (
    <div>
      <h2>{params.date} 수정</h2>

      <textarea
        placeholder="오늘은..."
        style={{
          width: "100%",
          minHeight: "240px",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      <button style={{ marginTop: 20, padding: 10 }}>저장</button>
    </div>
  );
}
