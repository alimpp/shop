import { BaseStore } from "~/core/BaseStore";
import { StoreManager } from "~/core/StoreManager";

import type {
  TChat,
  TChatListMeta,
  TChatMessage,
  TChatMessagesData,
  TChatMessagesQuery,
  TChatListQuery,
} from "../types/index.type";
import { ChatMessageModel, ChatModel } from "../models/index.model";

interface IChatState {
  chats: ChatModel[];
  selectedChat: ChatModel | null;
  messages: ChatMessageModel[];
  meta: TChatListMeta;
  messagesMeta: TChatListMeta;
  loading: boolean;
  messagesLoading: boolean;
  sending: boolean;
  submitting: boolean;
}

export class ChatDS extends BaseStore<IChatState> {
  private static _instance: ChatDS;

  public static getInstance(): ChatDS {
    if (!ChatDS._instance) {
      ChatDS._instance = new ChatDS();
    }
    return ChatDS._instance;
  }

  private constructor() {
    super("chat", {
      chats: [],
      selectedChat: null,
      messages: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
      messagesMeta: { total: 0, page: 1, limit: 20, totalPages: 0 },
      loading: false,
      messagesLoading: false,
      sending: false,
      submitting: false,
    });

    StoreManager.register(this);
  }

  public get getChats(): ChatModel[] {
    return this._state.chats;
  }

  public get getSelectedChat(): ChatModel | null {
    return this._state.selectedChat;
  }

  public get getMessages(): ChatMessageModel[] {
    return this._state.messages;
  }

  public get getMeta(): TChatListMeta {
    return this._state.meta;
  }

  public get getMessagesMeta(): TChatListMeta {
    return this._state.messagesMeta;
  }

  public get getLoading(): boolean {
    return this._state.loading;
  }

  public get getMessagesLoading(): boolean {
    return this._state.messagesLoading;
  }

  public get getSending(): boolean {
    return this._state.sending;
  }

  public get getSubmitting(): boolean {
    return this._state.submitting;
  }

  public setChats(chats: TChat[]): void {
    this._state.chats = chats.map((chat) => new ChatModel(chat));
  }

  public setSelectedChat(chat: TChat | null): void {
    this._state.selectedChat = chat ? new ChatModel(chat) : null;
  }

  public setMessages(messages: TChatMessage[]): void {
    this._state.messages = messages.map((msg) => new ChatMessageModel(msg));
  }

  public setMeta(meta: TChatListMeta): void {
    this._state.meta = { ...meta };
  }

  public setMessagesMeta(meta: TChatListMeta): void {
    this._state.messagesMeta = { ...meta };
  }

  public setLoading(loading: boolean): void {
    this._state.loading = loading;
  }

  public setMessagesLoading(loading: boolean): void {
    this._state.messagesLoading = loading;
  }

  public setSending(sending: boolean): void {
    this._state.sending = sending;
  }

  public setSubmitting(submitting: boolean): void {
    this._state.submitting = submitting;
  }

  public addMessage(message: TChatMessage): void {
    const model = new ChatMessageModel(message);
    const exists = this._state.messages.some((m) => m.id === model.id);
    if (!exists) {
      this._state.messages.push(model);
    }
  }

  public addChat(chat: TChat): void {
    const model = new ChatModel(chat);
    const exists = this._state.chats.some((c) => c.id === model.id);
    if (!exists) {
      this._state.chats = [model, ...this._state.chats];
    }
  }

  public updateLastMessage(chatId: string, message: TChatMessage): void {
    const chat = this._state.chats.find((c) => c.id === chatId);
    if (chat) {
      const isAdminSender = Boolean(message.sender?.username || message.sender?.role);
      chat.lastMessage = {
        id: message.id,
        content: message.content ?? "",
        createdAt: message.created_at,
        senderUserId: isAdminSender ? undefined : message.sender?.id,
        senderAdminId: isAdminSender ? message.sender?.id : undefined,
      };
    }
  }

  public markMessageDeleted(messageId: string): void {
    const msg = this._state.messages.find((m) => m.id === messageId);
    if (msg) {
      msg.isDeleted = true;
      msg.content = null;
    }
  }

  public clearUnseenCount(chatId: string): void {
    const chat = this._state.chats.find((c) => c.id === chatId);
    if (chat) {
      chat.unseenCount = 0;
      chat.hasUnseen = false;
    }
  }

  public removeChat(id: string): void {
    this._state.chats = this._state.chats.filter((chat) => chat.id !== id);
  }

  public reset(): void {
    this._state.chats = [];
    this._state.selectedChat = null;
    this._state.messages = [];
    this._state.meta = { total: 0, page: 1, limit: 20, totalPages: 0 };
    this._state.messagesMeta = { total: 0, page: 1, limit: 20, totalPages: 0 };
    this._state.loading = false;
    this._state.messagesLoading = false;
    this._state.sending = false;
    this._state.submitting = false;
  }
}

export const useChatDS = () => ChatDS.getInstance();
