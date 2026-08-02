export interface ControllerResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

export interface ServerResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}