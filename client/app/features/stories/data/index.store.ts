import { BaseStore } from '~/core/BaseStore';
import { StoreManager } from '~/core/StoreManager';
import { StoryModel } from '../models/index.model';
import type { TStory } from '../types/index.type';

interface IStoriesState {
  stories: StoryModel[];
  selectedStory: StoryModel | null;
  loading: boolean;
  submitting: boolean;
}

export class StoriesDS extends BaseStore<IStoriesState> {
  private static _instance: StoriesDS;

  public static getInstance(): StoriesDS {
    if (!StoriesDS._instance) {
      StoriesDS._instance = new StoriesDS();
    }

    return StoriesDS._instance;
  }

  private constructor() {
    super('stories', {
      stories: [],
      selectedStory: null,
      loading: false,
      submitting: false,
    });

    StoreManager.register(this);
  }

  public get getStories(): StoryModel[] {
    return this._state.stories;
  }

  public get getSelectedStory(): StoryModel | null {
    return this._state.selectedStory;
  }

  public get getLoading(): boolean {
    return this._state.loading;
  }

  public get getSubmitting(): boolean {
    return this._state.submitting;
  }

  public setStories(stories: TStory[]): void {
    this._state.stories = stories.map((story) => new StoryModel(story));
  }

  public setSelectedStory(story: TStory | null): void {
    this._state.selectedStory = story ? new StoryModel(story) : null;
  }

  public setLoading(loading: boolean): void {
    this._state.loading = loading;
  }

  public setSubmitting(submitting: boolean): void {
    this._state.submitting = submitting;
  }

  public upsertStory(story: TStory): void {
    const model = new StoryModel(story);
    const index = this._state.stories.findIndex((item) => item.id === model.id);

    if (index === -1) {
      this._state.stories = [model, ...this._state.stories];
      return;
    }

    this._state.stories.splice(index, 1, model);
  }

  public removeStory(id: string): void {
    this._state.stories = this._state.stories.filter((story) => story.id !== id);
  }

  public reset(): void {
    this._state.stories = [];
    this._state.selectedStory = null;
    this._state.loading = false;
    this._state.submitting = false;
  }
}
