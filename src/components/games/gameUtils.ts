export interface DraggableItem {
  id: string;
  name: string;
  type: string;
  emoji: string;
}

export const ITEMS: DraggableItem[] = [
  { id: '1', name: 'Plastic Bottle', type: 'plastic', emoji: '🍾' },
  { id: '2', name: 'Banana Peel', type: 'organic', emoji: '🍌' },
  { id: '3', name: 'Soda Can', type: 'metal', emoji: '🥫' },
  { id: '4', name: 'Old Newspaper', type: 'paper', emoji: '📰' },
  { id: '5', name: 'Apple Core', type: 'organic', emoji: '🍎' },
];

export const BINS = [
  { id: 'plastic', name: 'Dry Bin (Plastic)', color: '#3b82f6' },
  { id: 'organic', name: 'Wet Bin (Organic)', color: '#22c55e' },
  { id: 'metal', name: 'Recyclable (Metal)', color: '#f59e0b' },
  { id: 'paper', name: 'Paper Bin', color: '#8b5cf6' },
];

export const QUIZ_QUESTIONS = [
  {
    question: "Where does a plastic water bottle go?",
    options: ["Wet Bin", "Dry Bin", "E-Waste"],
    correctAnswer: 1
  },
  {
    question: "Is a banana peel considered wet or dry waste?",
    options: ["Wet Waste", "Dry Waste", "Recyclable"],
    correctAnswer: 0
  },
  {
    question: "Which bin should you use for an old newspaper?",
    options: ["Dry Bin", "Wet Bin", "Paper Bin"],
    correctAnswer: 2
  },
  {
    question: "What should you do with used batteries?",
    options: ["Throw in Wet Bin", "Throw in Dry Bin", "Send to E-Waste Center"],
    correctAnswer: 2
  }
];
