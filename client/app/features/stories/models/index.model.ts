import type { TStory, TStoryVisitor } from '../types/index.type';

export class StoryModel implements TStory {
  id: string;
  imageUrl: string;
  duration: number;
  isActive: boolean;
  visitors: TStoryVisitor[];
  visitorCount?: number;
  createdAt?: string;
  updatedAt?: string;

  constructor(data?: Partial<TStory>) {
    this.id = data?.id ?? '';
    this.imageUrl = data?.imageUrl ?? '';
    this.duration = data?.duration ?? 0;
    this.isActive = data?.isActive ?? true;
    this.visitors = data?.visitors ?? [];
    this.visitorCount = data?.visitorCount ?? this.visitors.length;
    this.createdAt = data?.createdAt ?? '';
    this.updatedAt = data?.updatedAt ?? '';
  }
}
