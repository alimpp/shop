import type { ServerResponse } from '~/types/common';
import { BaseApp } from '~/core/BaseApp';
import type { TStory, TStoryPayload } from '../types/index.type';

type TRawStory = Record<string, any>;

export class StoriesService extends BaseApp<TStory> {
  constructor() {
    super('stories');
  }

  private normalizeStory(item: TRawStory): TStory {
    return {
      id: item.id ?? '',
      imageUrl: item.imageUrl ?? '',
      duration: typeof item.duration === 'number' ? item.duration : Number(item.duration) || 0,
      isActive: item.isActive ?? true,
      visitors: Array.isArray(item.visitors) ? item.visitors : [],
      visitorCount: Array.isArray(item.visitors) ? item.visitors.length : 0,
      createdAt: item.createdAt ?? '',
      updatedAt: item.updatedAt ?? '',
    };
  }

  public async getStories(): Promise<ServerResponse<TStory[]>> {
    return this.executeRequest<TStory[]>(async () => {
      const response = await this.Get<ServerResponse<TRawStory[]>>('/stories');

      return {
        ...response,
        data: Array.isArray(response.data)
          ? response.data.map((item) => this.normalizeStory(item))
          : [],
      };
    });
  }

  public async createStory(payload: TStoryPayload): Promise<ServerResponse<TStory>> {
    return this.executeRequest<TStory>(async () => {
      const response = await this.Post<ServerResponse<TRawStory>>('/stories', payload);

      return {
        ...response,
        data: this.normalizeStory(response.data),
      };
    });
  }

  public async updateStory(id: string, payload: TStoryPayload): Promise<ServerResponse<TStory>> {
    return this.executeRequest<TStory>(async () => {
      const response = await this.Patch<ServerResponse<TRawStory>>(`/stories/${id}`, payload);

      return {
        ...response,
        data: this.normalizeStory(response.data),
      };
    });
  }

  public async deleteStory(id: string): Promise<ServerResponse<{ id: string }>> {
    return this.executeRequest<{ id: string }>(async () => {
      const response = await this.Delete<ServerResponse<Record<string, unknown>>>(`/stories/${id}`);

      return {
        ...response,
        data: { id },
      };
    });
  }
}
