export interface Message {
  content: string;
  opinion: null | number;
}

export interface MessagePair {
  userPrompt: Message;
  aiReply: Message;
}

export function parseChatString(chatString: string): MessagePair[] {
  if (!chatString) {
    return [];
  }
  const messages: MessagePair[] = [];
  const pairs = chatString.split(';;')
  for (const pair of pairs) {
    const [userPrompt, aiReply] = pair.split('::');
    const [aiText, aiOpinion] = aiReply.split('|');
    messages.push({
      userPrompt: { content: userPrompt.trim(), opinion: null },
      aiReply: { content: aiText, opinion: parseInt(aiOpinion) }
    });
  }
  
  return messages;
}
