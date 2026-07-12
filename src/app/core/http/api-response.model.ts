export interface PageMetadata {
  readonly page: number;
  readonly size: number;
  readonly totalElements: number;
  readonly totalPages: number;
}

export interface ApiResponse<T> {
  readonly code: string;
  readonly message: string;
  readonly data: T;
  readonly metadata?: PageMetadata;
}
