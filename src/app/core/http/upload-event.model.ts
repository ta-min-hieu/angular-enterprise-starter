export interface UploadProgressEvent {
  readonly type: 'progress';
  readonly percent: number;
}

export interface UploadDoneEvent<T> {
  readonly type: 'done';
  readonly data: T;
}

export type UploadEvent<T> = UploadProgressEvent | UploadDoneEvent<T>;
