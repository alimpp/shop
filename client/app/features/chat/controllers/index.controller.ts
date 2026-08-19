import type { ControllerResponse, ServerResponse } from "~/types/common";

import { BaseController } from "~/core/BaseController";
import { ChatDS } from "../data/index.store";
import { ChatService } from "../services/index.service";

import type {
  TChat,
  TChatListData,
  TChatListQuery,
  TChatMessage,
  TChatMessagesData,
  TChatMessagesQuery,
  TCreateChatPayload,
  TSendMessagePayload,
} from "../types/index.type";

class ChatController extends BaseController<ChatService> {
  constructor() {
    super(new ChatService());
  }

  private readonly chatDS = ChatDS.getInstance();

  public async getChatsForAdmin(
    query?: TChatListQuery
  ): Promise<ControllerResponse<TChatListData>> {
    this.chatDS.setLoading(true);

    const response: ServerResponse<TChatListData> =
      await this.service.getChatsForAdmin(query);

    if (response.success) {
      this.chatDS.setChats(response.data.items);
      this.chatDS.setMeta(response.data.meta);
    }

    this.chatDS.setLoading(false);

    return this.handleResponse(response);
  }

  public async getChatsForUser(
    query?: TChatListQuery
  ): Promise<ControllerResponse<TChatListData>> {
    this.chatDS.setLoading(true);

    const response: ServerResponse<TChatListData> =
      await this.service.getChatsForUser(query);

    if (response.success) {
      this.chatDS.setChats(response.data.items);
      this.chatDS.setMeta(response.data.meta);
    }

    this.chatDS.setLoading(false);

    return this.handleResponse(response);
  }

  public async getMessages(
    chatId: string,
    query?: TChatMessagesQuery,
    options?: { silent?: boolean }
  ): Promise<ControllerResponse<TChatMessagesData>> {
    if (!options?.silent) {
      this.chatDS.setMessagesLoading(true);
    }

    const response: ServerResponse<TChatMessagesData> =
      await this.service.getMessages(chatId, query);

    if (response.success) {
      this.chatDS.setMessages(response.data.items);
      this.chatDS.setMessagesMeta(response.data.meta);
    }

    if (!options?.silent) {
      this.chatDS.setMessagesLoading(false);
    }

    return this.handleResponse(response);
  }

  public async sendMessage(
    chatId: string,
    payload: TSendMessagePayload
  ): Promise<ControllerResponse<TChatMessage>> {
    this.chatDS.setSending(true);

    const response: ServerResponse<TChatMessage> =
      await this.service.sendMessage(chatId, payload);

    if (response.success) {
      this.chatDS.addMessage(response.data);
      this.chatDS.updateLastMessage(chatId, response.data);
    }

    this.chatDS.setSending(false);

    return this.handleResponse(response);
  }

  public async sendProductInquiry(
    content: string
  ): Promise<ControllerResponse<TChatMessage>> {
    this.chatDS.setSending(true);

    const listResponse: ServerResponse<TChatListData> =
      await this.service.getChatsForUser({ limit: 20 });

    if (!listResponse.success) {
      this.chatDS.setSending(false);
      return {
        success: false,
        message: listResponse.message ?? "دریافت چت پشتیبانی ناموفق بود",
        data: undefined as unknown as TChatMessage,
      };
    }

    if (listResponse.data) {
      this.chatDS.setChats(listResponse.data.items);
      this.chatDS.setMeta(listResponse.data.meta);
    }

    let chatId =
      this.chatDS.getChats.find((chat) => chat.status === "open")?.id;

    if (!chatId) {
      const created: ServerResponse<TChat> = await this.service.createChat({
        subject: "چت پشتیبانی",
      });

      if (!created.success || !created.data?.id) {
        this.chatDS.setSending(false);
        return {
          success: false,
          message: created.message ?? "ایجاد چت پشتیبانی ناموفق بود",
          data: undefined as unknown as TChatMessage,
        };
      }

      this.chatDS.addChat(created.data);
      this.chatDS.setSelectedChat(created.data);
      chatId = created.data.id;
    } else {
      const selected =
        this.chatDS.getChats.find((chat) => chat.id === chatId) ?? null;
      if (selected) {
        this.chatDS.setSelectedChat(selected);
      }
    }

    const response: ServerResponse<TChatMessage> =
      await this.service.sendMessage(chatId, { content });

    if (response.success && response.data) {
      this.chatDS.addMessage(response.data);
      this.chatDS.updateLastMessage(chatId, response.data);
    }

    this.chatDS.setSending(false);
    return this.handleResponse(response);
  }

  public async createChat(
    payload: TCreateChatPayload
  ): Promise<ControllerResponse<TChat>> {
    this.chatDS.setSubmitting(true);

    const response: ServerResponse<TChat> =
      await this.service.createChat(payload);

    if (response.success) {
      this.chatDS.addChat(response.data);
    }

    this.chatDS.setSubmitting(false);

    return this.handleResponse(response);
  }

  public async deleteMessage(
    chatId: string,
    messageId: string
  ): Promise<ControllerResponse<{ message: string }>> {
    const response: ServerResponse<{ message: string }> =
      await this.service.deleteMessage(chatId, messageId);

    if (response.success) {
      this.chatDS.markMessageDeleted(messageId);
    }

    return this.handleResponse(response);
  }

  public async markAsRead(
    chatId: string
  ): Promise<ControllerResponse<{ message: string }>> {
    const response: ServerResponse<{ message: string }> =
      await this.service.markAsRead(chatId);

    if (response.success) {
      this.chatDS.clearUnseenCount(chatId);
    }

    return this.handleResponse(response);
  }
}

export const chatController = new ChatController();
