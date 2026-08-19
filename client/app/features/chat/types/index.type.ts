export type TChatStatus = "open" | "closed";
export type TChatReadFilter = "all" | "read" | "unread";

export interface TChatUser {
  id: string;
  fristname: string;
  lastname: string;
  avatarUrl?: string;
  phone?: string;
}

export interface TChatAdmin {
  id: string;
  username: string;
  role: string;
}

export interface TChatMessageSender {
  id: string;
  fristname?: string;
  lastname?: string;
  avatarUrl?: string;
  phone?: string;
  username?: string;
  role?: string;
}

export interface TChatMessageReplyTo {
  id: string;
  content: string | null;
  isDeleted: boolean;
  sender?: TChatMessageSender | null;
}

export interface TChatMessage {
  id: string;
  chatId: string;
  content: string | null;
  isDeleted: boolean;
  deletedAt?: string;
  created_at: string;
  sender?: TChatMessageSender | null;
  replyTo?: TChatMessageReplyTo | null;
}

export interface TChatLastMessage {
  id: string;
  content: string;
  createdAt: string;
  senderUserId?: string;
  senderAdminId?: string;
}

export interface TChat {
  id: string;
  subject?: string;
  status: TChatStatus;
  created_at: string;
  updated_at?: string;
  lastMessage?: TChatLastMessage | null;
  user?: TChatUser | null;
  unseenCount: number;
  hasUnseen?: boolean;
}

export interface TChatListQuery {
  page?: number;
  limit?: number;
  filter?: TChatReadFilter;
}

export interface TChatMessagesQuery {
  page?: number;
  limit?: number;
}

export interface TChatListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TChatListData {
  items: TChat[];
  meta: TChatListMeta;
}

export interface TChatMessagesData {
  items: TChatMessage[];
  meta: TChatListMeta;
}

export interface TCreateChatPayload {
  subject?: string;
}

export interface TSendMessagePayload {
  content: string;
  replyToId?: string;
}

export function buildProductSupportMessage(
  productName: string,
  productUrl: string
): string {
  return `${productName.trim()}\n${productUrl.trim()}\nراجع به این محصول من رو راهنمایی می‌کنی؟`;
}
