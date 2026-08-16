import type { ControllerResponse, ServerResponse } from '~/types/common';
import { BaseController } from '~/core/BaseController';
import { StoriesDS } from '../data/index.store';
import { StoriesService } from '../services/index.service';
import type { TStory, TStoryPayload } from '../types/index.type';

class StoriesController extends BaseController<StoriesService> {
  constructor() {
    super(new StoriesService());
  }

  private readonly storiesDS = StoriesDS.getInstance();

  public async getStories(): Promise<ControllerResponse<TStory[]>> {
    this.storiesDS.setLoading(true);

    const response: ServerResponse<TStory[]> = await this.service.getStories();

    if (response.success) {
      this.storiesDS.setStories(response.data);
    }

    this.storiesDS.setLoading(false);
    return this.handleResponse(response);
  }

  public async createStory(payload: TStoryPayload): Promise<ControllerResponse<TStory>> {
    this.storiesDS.setSubmitting(true);

    const response: ServerResponse<TStory> = await this.service.createStory(payload);

    if (response.success) {
      this.storiesDS.upsertStory(response.data);
    }

    this.storiesDS.setSubmitting(false);
    return this.handleResponse(response);
  }

  public async updateStory(id: string, payload: TStoryPayload): Promise<ControllerResponse<TStory>> {
    this.storiesDS.setSubmitting(true);

    const response: ServerResponse<TStory> = await this.service.updateStory(id, payload);

    if (response.success) {
      this.storiesDS.upsertStory(response.data);
      this.storiesDS.setSelectedStory(response.data);
    }

    this.storiesDS.setSubmitting(false);
    return this.handleResponse(response);
  }

  public async deleteStory(id: string): Promise<ControllerResponse<{ id: string }>> {
    this.storiesDS.setSubmitting(true);

    const response: ServerResponse<{ id: string }> = await this.service.deleteStory(id);

    if (response.success) {
      this.storiesDS.removeStory(id);
      if (this.storiesDS.getSelectedStory?.id === id) {
        this.storiesDS.setSelectedStory(null);
      }
    }

    this.storiesDS.setSubmitting(false);
    return this.handleResponse(response);
  }
}

export const storiesController = new StoriesController();
