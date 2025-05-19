import { ResponseInput } from "openai/resources/responses/responses";

// Shared session state
export const chatSessions: Map<number, ResponseInput> = new Map();
let sessionId: number = 1;

export function getSessionId(): number {
  return sessionId;
}

export function setSessionId(newId: number): void {
  sessionId = newId;
}

export function listSessionIds(): number[] {
  return Array.from(chatSessions.keys());
}

export function getChatSession(id: number): ResponseInput | undefined {
  return chatSessions.get(id);
}

export function setChatSession(id: number, session: ResponseInput): void {
  chatSessions.set(id, session);
}
