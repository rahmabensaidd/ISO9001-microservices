export interface ChatMessage {
  sender: string;
  content?: string;
  type: 'CHAT' | 'JOIN' | 'LEAVE';
}
