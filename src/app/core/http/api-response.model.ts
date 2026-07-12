export interface ApiResponse<T> {
  readonly code: string;
  readonly message: string;
  readonly data: T;
}
