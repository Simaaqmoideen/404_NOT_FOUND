export function getChatbotResponse(query: string): string {
  const q = query.toLowerCase();
  
  if (q.includes('plastic')) return "Plastic waste should go into the dry bin. Ensure it is clean and dry.";
  if (q.includes('battery') || q.includes('batteries') || q.includes('e-waste')) return "Batteries and electronic items should be disposed of in special hazardous waste bins or e-waste centers.";
  if (q.includes('paper') || q.includes('cardboard')) return "Paper and cardboard go into the Paper or Recyclable bin.";
  if (q.includes('organic') || q.includes('food') || q.includes('peel') || q.includes('wet')) return "Food scraps and organic waste belong in the wet bin.";
  if (q.includes('glass') || q.includes('metal') || q.includes('can')) return "Glass, metal cans, and foil should go into the Recyclable bin.";
  if (q.includes('hello') || q.includes('hi')) return "Hello! I'm your BinWise Assistant. How can I help you sort your waste today?";
  if (q.includes('point') || q.includes('reward')) return "You earn eco-points by scanning and depositing waste in the correct bins. You can claim rewards in your dashboard!";
  
  return "I'm not quite sure. Please try asking about waste types like plastic, metal, or organic.";
}
