import type { ServerResponse } from "~/types/common";

import { BaseApp } from "~/core/BaseApp";
import type { TFileItem, TFileListData } from "../types/index.type";

type TRawFile = Record<string, any>;

export class FilesService extends BaseApp<TFileItem> {
  constructor() {
    super("files");
  }

  private normalizeFile(item: TRawFile): TFileItem {
    return {
      id: item.id ?? "",
      filename: item.filename ?? "",
      originalname: item.originalname ?? item.originalName ?? "",
      mimetype: item.mimetype ?? "",
      size: Number(item.size ?? 0),
      path: item.path ?? "",
      createdAt: item.createdAt ?? ""
    };
  }

  private normalizeList(files: TRawFile[]): TFileListData {
    const items = files.map((file) => this.normalizeFile(file));
    return {
      items,
      total: items.length
    };
  }

  public async getFiles(): Promise<ServerResponse<TFileListData>> {
    return this.executeRequest<TFileListData>(async () => {
      const response = await this.Get<ServerResponse<TRawFile[]>>("/files");

      return {
        ...response,
        data: this.normalizeList(response.data ?? [])
      };
    });
  }

  public async uploadFile(file: File): Promise<ServerResponse<TFileItem>> {
    return this.executeRequest<TFileItem>(async () => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await this.Upload<ServerResponse<TRawFile>>(
        "/files/upload",
        formData
      );

      return {
        ...response,
        data: this.normalizeFile(response.data)
      };
    });
  }

  public async deleteFile(id: string): Promise<ServerResponse<{ id: string }>> {
    return this.executeRequest<{ id: string }>(async () => {
      const response = await this.Delete<ServerResponse<Record<string, unknown>>>(
        `/files/${id}`
      );

      return {
        ...response,
        data: { id }
      };
    });
  }
}

