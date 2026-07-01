import type { ChatMessage, UserProfile, WhatsAppMessage } from "@/types";

export interface UserSession {
  profile: UserProfile;
  whatsappMessages: WhatsAppMessage[];
  sentAlerts: Record<string, string>;
  chatHistory: ChatMessage[];
  emergencyPaused: boolean;
  updatedAt: string;
}

export interface UserStore {
  saveUser(profile: UserProfile): Promise<void>;
  getUserByPhone(phone: string): Promise<UserSession | null>;
  findUserByPhone(phone: string): Promise<UserSession | null>;
  listUserPhones(): Promise<string[]>;
  addWhatsAppMessage(phone: string, message: WhatsAppMessage): Promise<void>;
  getWhatsAppMessages(phone: string): Promise<WhatsAppMessage[]>;
  markAlertSent(phone: string, key: string): Promise<void>;
  getSentAlerts(phone: string): Promise<Record<string, string>>;
  addChatTurn(
    phone: string,
    userText: string,
    assistantText: string
  ): Promise<void>;
  getChatHistory(phone: string, limit?: number): Promise<ChatMessage[]>;
  setEmergencyPaused(phone: string, paused: boolean): Promise<void>;
  isEmergencyPaused(phone: string): Promise<boolean>;
}