export interface TStoryVisitor {
  id: string;
  fristname: string;
  lastname: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  created_at?: string;
}

export interface TStory {
  id: string;
  imageUrl: string;
  duration: number;
  isActive: boolean;
  visitors: TStoryVisitor[];
  visitorCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TStoryPayload {
  imageUrl: string;
  duration: number;
  isActive?: boolean;
}
