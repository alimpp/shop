import type {
  TChat,
  TChatLastMessage,
  TChatMessage,
  TChatMessageReplyTo,
  TChatMessageSender,
  TChatStatus,
  TChatUser,
} from "../types/index.type";

class ChatMessageSenderModel implements TChatMessageSender {
  id: string;
  fristname?: string;
  lastname?: string;
  avatarUrl?: string;
  phone?: string;
  username?: string;
  role?: string;

  constructor(data?: Partial<TChatMessageSender>) {
    this.id = data?.id ?? "";
    this.fristname = data?.fristname;
    this.lastname = data?.lastname;
    this.avatarUrl = data?.avatarUrl;
    this.phone = data?.phone;
    this.username = data?.username;
    this.role = data?.role;
  }

  get displayName(): string {
    if (this.username) return this.username;
    return [this.fristname, this.lastname].filter(Boolean).join(" ") || "ناشناس";
  }
}

class ChatMessageReplyToModel implements TChatMessageReplyTo {
  id: string;
  content: string | null;
  isDeleted: boolean;
  sender?: TChatMessageSender | null;

  constructor(data?: Partial<TChatMessageReplyTo>) {
    this.id = data?.id ?? "";
    this.content = data?.content ?? null;
    this.isDeleted = data?.isDeleted ?? false;
    this.sender = data?.sender ? new ChatMessageSenderModel(data.sender) : null;
  }
}

export class ChatMessageModel implements TChatMessage {
  id: string;
  chatId: string;
  content: string | null;
  isDeleted: boolean;
  deletedAt?: string;
  created_at: string;
  sender?: TChatMessageSender | null;
  replyTo?: TChatMessageReplyTo | null;

  constructor(data?: Partial<TChatMessage>) {
    this.id = data?.id ?? "";
    this.chatId = data?.chatId ?? "";
    this.content = data?.content ?? null;
    this.isDeleted = data?.isDeleted ?? false;
    this.deletedAt = data?.deletedAt;
    this.created_at = data?.created_at ?? "";
    this.sender = data?.sender ? new ChatMessageSenderModel(data.sender) : null;
    this.replyTo = data?.replyTo ? new ChatMessageReplyToModel(data.replyTo) : null;
  }

  get isOwnMessage(): boolean {
    return false;
  }

  get formattedTime(): string {
    if (!this.created_at) return "";
    const date = new Date(this.created_at);
    return date.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  }

  get formattedDate(): string {
    if (!this.created_at) return "";
    const date = new Date(this.created_at);
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}

class ChatUserModel implements TChatUser {
  id: string;
  fristname: string;
  lastname: string;
  avatarUrl?: string;
  phone?: string;

  constructor(data?: Partial<TChatUser>) {
    this.id = data?.id ?? "";
    this.fristname = data?.fristname ?? "";
    this.lastname = data?.lastname ?? "";
    this.avatarUrl = data?.avatarUrl;
    this.phone = data?.phone;
  }

  get displayName(): string {
    return [this.fristname, this.lastname].filter(Boolean).join(" ") || "ناشناس";
  }
}

class ChatLastMessageModel implements TChatLastMessage {
  id: string;
  content: string;
  createdAt: string;
  senderUserId?: string;
  senderAdminId?: string;

  constructor(data?: Partial<TChatLastMessage>) {
    this.id = data?.id ?? "";
    this.content = data?.content ?? "";
    this.createdAt = data?.createdAt ?? "";
    this.senderUserId = data?.senderUserId;
    this.senderAdminId = data?.senderAdminId;
  }
}

export class ChatModel implements TChat {
  id: string;
  subject?: string;
  status: TChatStatus;
  created_at: string;
  updated_at?: string;
  lastMessage?: TChatLastMessage | null;
  user?: TChatUser | null;
  unseenCount: number;
  hasUnseen?: boolean;

  constructor(data?: Partial<TChat>) {
    this.id = data?.id ?? "";
    this.subject = data?.subject;
    this.status = data?.status ?? "open";
    this.created_at = data?.created_at ?? "";
    this.updated_at = data?.updated_at;
    this.lastMessage = data?.lastMessage ? new ChatLastMessageModel(data.lastMessage) : null;
    this.user = data?.user ? new ChatUserModel(data.user) : null;
    this.unseenCount = data?.unseenCount ?? 0;
    this.hasUnseen = data?.hasUnseen;
  }

  get displaySubject(): string {
    return this.subject || this.user?.displayName || `چت #${this.id.slice(0, 8)}`;
  }

  get formattedDate(): string {
    if (!this.created_at) return "";
    const date = new Date(this.created_at);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
    }
    if (diffDays === 1) return "دیروز";
    if (diffDays < 7) return `${diffDays} روز پیش`;
    return date.toLocaleDateString("fa-IR", { month: "short", day: "numeric" });
  }
}
