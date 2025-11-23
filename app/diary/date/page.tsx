export default function DiaryRead({ params }: { params: { date: string } }) {
  return (
    <div>
      <h2>{params.date} 일기</h2>

      <div style={diaryBox}>
        오늘은 어떤 날이었나요?
      </div>

      <a href={`/diary/${params.date}/edit`} style={editButton}>
        수정하기
      </a>
    </div>
  );
}

const diaryBox = {
  padding: "20px",
  minHeight: "200px",
  background: "#eee",
  marginTop: "20px",
  borderRadius: "8px",
};

const editButton = {
  marginTop: "20px",
  display: "inline-block",
  padding: "10px",
  background: "#ccc",
  borderRadius: "6px",
};
