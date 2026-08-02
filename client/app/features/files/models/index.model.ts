import type { TFileItem } from "../types/index.type";

export class FileModel implements TFileItem {
  id: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
  createdAt?: string;

  constructor(data?: Partial<TFileItem>) {
    this.id = data?.id ?? "";
    this.filename = data?.filename ?? "";
    this.originalname = data?.originalname ?? "";
    this.mimetype = data?.mimetype ?? "";
    this.size = data?.size ?? 0;
    this.path = data?.path ?? "";
    this.createdAt = data?.createdAt ?? "";
  }
}
