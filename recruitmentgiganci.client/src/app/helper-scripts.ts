export interface Message {
  id: number;
  content: string;
  type: 'user' | 'ai';
  opinion: null | number;
}

export function parseChatString(chatString: string): Message[] {
  if (!chatString) {
    return [];
  }
  const messages: Message[] = [];
  const pairs = chatString.split(';;')
  let msgId = 0;
  pairs.forEach(pair => {
    const [userPrompt, aiReply] = pair.split('::');    
    messages.push({
      id: msgId++,
      content: userPrompt,
      type: 'user',
      opinion: null,
    });

    if (aiReply) {
      const [aiText, aiOpinion] = aiReply.split('|');
      messages.push({
        id: msgId++,
        content: aiText.replaceAll("\\n", "\n"),
        type: 'ai',
        opinion: parseInt(aiOpinion),
      });
    }
  });
  
  return messages;
}

export function formatChatString(messages: Message[]): string {
  return messages.reduce((acc, msg, index) => {
    if (msg.type === 'user') {
      acc += msg.content + '::';
    } else if (msg.type === 'ai') {
      acc += msg.content + '|' + (msg.opinion !== null ? msg.opinion : '') + ';;';
    }
    return acc;
  }, '').slice(0, -2); // Remove the last ';;'
}
