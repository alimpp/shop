export interface TFileItem {
  id: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
  createdAt?: string;
}

export interface TFileListData {
  items: TFileItem[];
  total: number;
}
