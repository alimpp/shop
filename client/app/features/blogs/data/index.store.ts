import { BaseStore } from "~/core/BaseStore";
import { StoreManager } from "~/core/StoreManager";
import { BlogModel } from "../models/index.model";
import type { TBlog } from "../types/index.type";

interface IBlogsState {
  blogs: BlogModel[];
  selectedBlog: BlogModel | null;
  loading: boolean;
  submitting: boolean;
}

export class BlogsDS extends BaseStore<IBlogsState> {
  private static _instance: BlogsDS;

  public static getInstance(): BlogsDS {
    if (!BlogsDS._instance) {
      BlogsDS._instance = new BlogsDS();
    }

    return BlogsDS._instance;
  }

  private constructor() {
    super("blogs", {
      blogs: [],
      selectedBlog: null,
      loading: false,
      submitting: false,
    });

    StoreManager.register(this);
  }

  public get getBlogs(): BlogModel[] {
    return this._state.blogs;
  }

  public get getSelectedBlog(): BlogModel | null {
    return this._state.selectedBlog;
  }

  public get getLoading(): boolean {
    return this._state.loading;
  }

  public get getSubmitting(): boolean {
    return this._state.submitting;
  }

  public setBlogs(blogs: TBlog[]): void {
    this._state.blogs = blogs.map((blog) => new BlogModel(blog));
  }

  public setSelectedBlog(blog: TBlog | null): void {
    this._state.selectedBlog = blog ? new BlogModel(blog) : null;
  }

  public setLoading(loading: boolean): void {
    this._state.loading = loading;
  }

  public setSubmitting(submitting: boolean): void {
    this._state.submitting = submitting;
  }

  public upsertBlog(blog: TBlog): void {
    const model = new BlogModel(blog);
    const index = this._state.blogs.findIndex((item) => item.id === model.id);

    if (index === -1) {
      this._state.blogs = [model, ...this._state.blogs];
      return;
    }

    this._state.blogs.splice(index, 1, model);
  }

  public removeBlog(id: string): void {
    this._state.blogs = this._state.blogs.filter((blog) => blog.id !== id);
  }

  public reset(): void {
    this._state.blogs = [];
    this._state.selectedBlog = null;
    this._state.loading = false;
    this._state.submitting = false;
  }
}
