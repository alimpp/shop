import { BaseStore } from "~/core/BaseStore";
import { StoreManager } from "~/core/StoreManager";

import type { TFileItem } from "../types/index.type";
import { FileModel } from "../models/index.model";

interface IFilesState {
  files: FileModel[];
  selectedFile: FileModel | null;
  loading: boolean;
  submitting: boolean;
}

export class FilesDS extends BaseStore<IFilesState> {
  private static _instance: FilesDS;

  public static getInstance(): FilesDS {
    if (!FilesDS._instance) {
      FilesDS._instance = new FilesDS();
    }
    return FilesDS._instance;
  }

  private constructor() {
    super("files", {
      files: [],
      selectedFile: null,
      loading: false,
      submitting: false
    });

    StoreManager.register(this);
  }

  public get getFiles(): FileModel[] {
    return this._state.files;
  }

  public get getSelectedFile(): FileModel | null {
    return this._state.selectedFile;
  }

  public get getLoading(): boolean {
    return this._state.loading;
  }

  public get getSubmitting(): boolean {
    return this._state.submitting;
  }

  public setFiles(files: TFileItem[]): void {
    this._state.files = files.map((file) => new FileModel(file));
  }

  public setSelectedFile(file: TFileItem | null): void {
    this._state.selectedFile = file ? new FileModel(file) : null;
  }

  public setLoading(loading: boolean): void {
    this._state.loading = loading;
  }

  public setSubmitting(submitting: boolean): void {
    this._state.submitting = submitting;
  }

  public upsertFile(file: TFileItem): void {
    const model = new FileModel(file);
    const index = this._state.files.findIndex((item) => item.id === model.id);

    if (index === -1) {
      this._state.files = [model, ...this._state.files];
      return;
    }

    this._state.files.splice(index, 1, model);
  }

  public removeFile(id: string): void {
    this._state.files = this._state.files.filter((file) => file.id !== id);
  }

  public reset(): void {
    this._state.files = [];
    this._state.selectedFile = null;
    this._state.loading = false;
    this._state.submitting = false;
  }
}

