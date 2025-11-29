// components/EmojiPicker.tsx
"use client";

const emojis = ["😀", "😢", "😡", "😍", "😭", "😆", "😴"];

export default function EmojiPicker({ selectedEmoji, setSelectedEmoji }: any) {
  return (
    <div className="flex gap-2 mb-4">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          className={`text-2xl px-2 py-1 rounded ${
            selectedEmoji === emoji ? "bg-yellow-300" : "bg-gray-200"
          }`}
          onClick={() => setSelectedEmoji(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
