import type { ServerResponse } from "~/types/common";

import { BaseApp } from "~/core/BaseApp";

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

type TRawChat = Record<string, any>;

export class ChatService extends BaseApp<TChat> {
  constructor() {
    super("chat");
  }

  public async getChatsForAdmin(
    query?: TChatListQuery
  ): Promise<ServerResponse<TChatListData>> {
    return this.executeRequest<TChatListData>(async () => {
      const response = await this.Get<ServerResponse<any>>("/chats", query);

      return {
        ...response,
        data: {
          items: Array.isArray(response.data?.items)
            ? response.data.items.map((item: TRawChat) => this.normalizeChat(item))
            : Array.isArray(response.data)
              ? response.data.map((item: TRawChat) => this.normalizeChat(item))
              : [],
          meta: {
            total: response.data?.total ?? 0,
            page: response.data?.page ?? 1,
            limit: response.data?.limit ?? 20,
            totalPages: response.data?.totalPages ?? 1,
          },
        },
      };
    });
  }

  public async getChatsForUser(
    query?: TChatListQuery
  ): Promise<ServerResponse<TChatListData>> {
    return this.executeRequest<TChatListData>(async () => {
      const response = await this.Get<ServerResponse<any>>("/chats/user", query);

      return {
        ...response,
        data: {
          items: Array.isArray(response.data?.items)
            ? response.data.items.map((item: TRawChat) => this.normalizeChat(item))
            : Array.isArray(response.data)
              ? response.data.map((item: TRawChat) => this.normalizeChat(item))
              : [],
          meta: {
            total: response.data?.total ?? 0,
            page: response.data?.page ?? 1,
            limit: response.data?.limit ?? 20,
            totalPages: response.data?.totalPages ?? 1,
          },
        },
      };
    });
  }

  public async getMessages(
    chatId: string,
    query?: TChatMessagesQuery,
    options?: { silent?: boolean },
  ): Promise<ServerResponse<TChatMessagesData>> {
    return this.executeRequest<TChatMessagesData>(async () => {
      const response = await this.Get<ServerResponse<any>>(
        `/chats/${chatId}/messages`,
        query,
        { silent: options?.silent },
      );

      return {
        ...response,
        data: {
          items: Array.isArray(response.data?.items)
            ? response.data.items.map((item: TRawChat) => this.normalizeMessage(item))
            : Array.isArray(response.data)
              ? response.data.map((item: TRawChat) => this.normalizeMessage(item))
              : [],
          meta: {
            total: response.data?.total ?? 0,
            page: response.data?.page ?? 1,
            limit: response.data?.limit ?? 20,
            totalPages: response.data?.totalPages ?? 1,
          },
        },
      };
    });
  }

  public async sendMessage(
    chatId: string,
    payload: TSendMessagePayload
  ): Promise<ServerResponse<TChatMessage>> {
    return this.executeRequest<TChatMessage>(async () => {
      const response = await this.Post<ServerResponse<TRawChat>>(
        `/chats/${chatId}/messages`,
        payload
      );

      return {
        ...response,
        data: this.normalizeMessage(response.data),
      };
    });
  }

  public async createChat(
    payload: TCreateChatPayload
  ): Promise<ServerResponse<TChat>> {
    return this.executeRequest<TChat>(async () => {
      const response = await this.Post<ServerResponse<TRawChat>>("/chats", payload);

      return {
        ...response,
        data: this.normalizeChat(response.data),
      };
    });
  }

  public async deleteMessage(
    chatId: string,
    messageId: string
  ): Promise<ServerResponse<{ message: string }>> {
    return this.executeRequest<{ message: string }>(async () => {
      const response = await this.Delete<ServerResponse<{ message: string }>>(
        `/chats/${chatId}/messages/${messageId}`
      );

      return {
        ...response,
        data: response.data,
      };
    });
  }

  public async markAsRead(
    chatId: string
  ): Promise<ServerResponse<{ message: string }>> {
    return this.executeRequest<{ message: string }>(async () => {
      const response = await this.Patch<ServerResponse<{ message: string }>>(
        `/chats/${chatId}/read`,
        {}
      );

      return {
        ...response,
        data: response.data,
      };
    });
  }

  private normalizeChat(item: TRawChat): TChat {
    return {
      id: item.id ?? "",
      subject: item.subject,
      status: item.status ?? "open",
      created_at: item.created_at ?? "",
      updated_at: item.updated_at,
      lastMessage: item.lastMessage
        ? {
            id: item.lastMessage.id ?? "",
            content: item.lastMessage.content ?? "",
            createdAt: item.lastMessage.createdAt ?? "",
            senderUserId: item.lastMessage.senderUserId,
            senderAdminId: item.lastMessage.senderAdminId,
          }
        : null,
      user: item.user
        ? {
            id: item.user.id ?? "",
            fristname: item.user.fristname ?? "",
            lastname: item.user.lastname ?? "",
            avatarUrl: item.user.avatarUrl,
            phone: item.user.phone,
          }
        : null,
      unseenCount: Number(item.unseenCount) || 0,
      hasUnseen: item.hasUnseen ?? false,
    };
  }

  private normalizeMessage(item: TRawChat): TChatMessage {
    return {
      id: item.id ?? "",
      chatId: item.chatId ?? "",
      content: item.content ?? null,
      isDeleted: item.isDeleted ?? false,
      deletedAt: item.deletedAt,
      created_at: item.created_at ?? "",
      sender: item.sender
        ? {
            id: item.sender.id ?? "",
            fristname: item.sender.fristname,
            lastname: item.sender.lastname,
            avatarUrl: item.sender.avatarUrl,
            phone: item.sender.phone,
            username: item.sender.username,
            role: item.sender.role,
          }
        : null,
      replyTo: item.replyTo
        ? {
            id: item.replyTo.id ?? "",
            content: item.replyTo.content ?? null,
            isDeleted: item.replyTo.isDeleted ?? false,
            sender: item.replyTo.sender
              ? {
                  id: item.replyTo.sender.id ?? "",
                  fristname: item.replyTo.sender.fristname,
                  lastname: item.replyTo.sender.lastname,
                  username: item.replyTo.sender.username,
                }
              : null,
          }
        : null,
    };
  }
}
