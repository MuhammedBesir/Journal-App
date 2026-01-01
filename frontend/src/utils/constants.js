export const MOODS = [
  { value: "Happy", emoji: "😊", color: "#FFC107" },
  { value: "Sad", emoji: "😢", color: "#2196F3" },
  { value: "Excited", emoji: "🤩", color: "#FF5722" },
  { value: "Anxious", emoji: "😰", color: "#9C27B0" },
  { value: "Grateful", emoji: "🙏", color: "#4CAF50" },
  { value: "Angry", emoji: "😠", color: "#F44336" },
  { value: "Peaceful", emoji: "😌", color: "#00BCD4" },
  { value: "Accomplished", emoji: "💪", color: "#8BC34A" },
  { value: "Tired", emoji: "😴", color: "#607D8B" },
  { value: "Inspired", emoji: "✨", color: "#E91E63" },
];

export const getMoodColor = (mood) => {
  const moodObj = MOODS.find((m) => m.value === mood);
  return moodObj ? moodObj.color : "#9E9E9E";
};

export const getMoodEmoji = (mood) => {
  const moodObj = MOODS.find((m) => m.value === mood);
  return moodObj ? moodObj.emoji : "📝";
};
