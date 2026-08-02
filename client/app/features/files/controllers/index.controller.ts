import type { ControllerResponse, ServerResponse } from "~/types/common";

import { BaseController } from "~/core/BaseController";
import { FilesDS } from "../data/index.store";
import { FilesService } from "../services/index.service";

import type { TFileItem, TFileListData } from "../types/index.type";

class FilesController extends BaseController<FilesService> {
  constructor() {
    super(new FilesService());
  }

  private readonly filesDS = FilesDS.getInstance();

  public async getFiles(): Promise<ControllerResponse<TFileListData>> {
    this.filesDS.setLoading(true);

    const response: ServerResponse<TFileListData> = await this.service.getFiles();

    if (response.success) {
      this.filesDS.setFiles(response.data.items);
    }

    this.filesDS.setLoading(false);

    return this.handleResponse(response);
  }

  public async uploadFile(file: File): Promise<ControllerResponse<TFileItem>> {
    this.filesDS.setSubmitting(true);

    const response: ServerResponse<TFileItem> = await this.service.uploadFile(file);

    if (response.success) {
      this.filesDS.upsertFile(response.data);
    }

    this.filesDS.setSubmitting(false);

    return this.handleResponse(response);
  }

  public async deleteFile(id: string): Promise<ControllerResponse<{ id: string }>> {
    this.filesDS.setSubmitting(true);

    const response: ServerResponse<{ id: string }> = await this.service.deleteFile(id);

    if (response.success) {
      this.filesDS.removeFile(id);
    }

    this.filesDS.setSubmitting(false);

    return this.handleResponse(response);
  }
}

export const filesController = new FilesController();

