import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UploadService } from './upload.service';

describe('UploadService', () => {
  let service: UploadService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UploadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  function driveInitAndChunks(uploadId: string, totalChunks: number) {
    const initReq = httpMock.expectOne('/api/files/uploads');
    expect(initReq.request.method).toBe('POST');
    initReq.flush({
      code: '200',
      message: 'Success',
      data: { uploadId, chunkSize: 10, totalChunks },
    });

    for (let i = 0; i < totalChunks; i += 1) {
      const chunkReq = httpMock.expectOne(`/api/files/uploads/${uploadId}/chunks/${i}`);
      expect(chunkReq.request.method).toBe('PUT');
      expect(chunkReq.request.headers.get('Content-Type')).toBe('application/octet-stream');
      chunkReq.flush({
        code: '200',
        message: 'Success',
        data: { uploadId, receivedChunks: i + 1, totalChunks, completed: i + 1 === totalChunks },
      });
    }
  }

  it('should init, upload every chunk, then complete and map the result to a MediaAsset', () => {
    const file = new File([new Uint8Array(25)], 'video.mp4', { type: 'video/mp4' });
    const events: unknown[] = [];
    const onInit = vi.fn();

    service
      .uploadChunked(file, { chunkSizeBytes: 10, onInit })
      .subscribe((event) => events.push(event));

    driveInitAndChunks('upload-1', 3);
    expect(onInit).toHaveBeenCalledWith('upload-1');

    const completeReq = httpMock.expectOne('/api/files/uploads/upload-1/complete');
    expect(completeReq.request.method).toBe('POST');
    completeReq.flush({
      code: '200',
      message: 'Success',
      data: {
        id: 9,
        originalFileName: 'video.mp4',
        fileCategory: 'video',
        contentType: 'video/mp4',
        fileSize: 25,
        url: '/v1/files/9',
      },
    });

    const doneEvents = events.filter(
      (event): event is { type: 'done' } => (event as { type: string }).type === 'done',
    );
    expect(doneEvents).toEqual([
      {
        type: 'done',
        data: {
          id: 9,
          type: 'video',
          name: 'video.mp4',
          size: 25,
          mimeType: 'video/mp4',
          url: '/v1/files/9',
        },
      },
    ]);

    const progressPercents = events
      .filter(
        (event): event is { type: 'progress'; percent: number } =>
          (event as { type: string }).type === 'progress',
      )
      .map((event) => event.percent);
    expect(progressPercents.length).toBeGreaterThan(0);
    expect(progressPercents[progressPercents.length - 1]).toBe(100);
  });

  it('should stop issuing further chunks when cancelled mid-flight', () => {
    const file = new File([new Uint8Array(25)], 'video.mp4', { type: 'video/mp4' });

    const subscription = service.uploadChunked(file, { chunkSizeBytes: 10 }).subscribe();

    const initReq = httpMock.expectOne('/api/files/uploads');
    initReq.flush({
      code: '200',
      message: 'Success',
      data: { uploadId: 'upload-2', chunkSize: 10, totalChunks: 3 },
    });

    const firstChunkReq = httpMock.expectOne('/api/files/uploads/upload-2/chunks/0');
    subscription.unsubscribe();

    expect(firstChunkReq.cancelled).toBe(true);
    httpMock.verify();
  });

  it('should send an abort request for the given uploadId', () => {
    service.abort('upload-3').subscribe();

    const req = httpMock.expectOne('/api/files/uploads/upload-3');
    expect(req.request.method).toBe('DELETE');
    req.flush({ code: '200', message: 'Success' });
  });
});
