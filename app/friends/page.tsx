export default function AddFriend() {
  return (
    <div>
      <h2>친구 추가</h2>

      <input placeholder="친구 ID" style={input} />
      <button style={button}>추가</button>
    </div>
  );
}

const input = {
  width: "100%",
  padding: "10px",
  marginTop: "12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const button = {
  marginTop: "20px",
  padding: "10px",
  background: "#ddd",
  borderRadius: "6px",
};
