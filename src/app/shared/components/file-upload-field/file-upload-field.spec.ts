import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { describe, expect, it, vi } from 'vitest';
import { FileUploadField, MediaFieldItem } from './file-upload-field';
import { MediaAsset } from '../../models/media-asset.model';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

// nz-upload gọi beforeUpload(file, fileList) với `file` LÀ File gốc từ input, chỉ gắn thêm `.uid`
// (xem NzUploadBtnComponent.attachUid/upload trong ng-zorro-antd) — KHÔNG có `.originFileObj`
// (field đó chỉ tồn tại trên NzUploadFile được dựng SAU, trong post(), mà ta không đi tới vì
// beforeUpload() luôn trả false). Test phải mô phỏng đúng shape thật này, không phải bịa
// {uid, name, originFileObj} — bịa sai từng khiến 1 bug thật (file không bao giờ được xử lý) lọt qua.
function createFile(name: string, type: string, sizeBytes = 100): File {
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

function toNzUploadFile(file: File, uid: string): NzUploadFile {
  return Object.assign(file, { uid }) as unknown as NzUploadFile;
}

describe('FileUploadField', () => {
  let httpMock: HttpTestingController;

  function setup(initial: MediaFieldItem[] = []) {
    TestBed.configureTestingModule({
      imports: [FileUploadField],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNzIcons(REGISTERED_ICONS),
        ...provideTranslocoTesting(),
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);

    const fixture = TestBed.createComponent(FileUploadField);
    fixture.componentRef.setInput('name', 'files');
    fixture.componentRef.setInput('label', 'Files');
    fixture.componentRef.setInput(
      'control',
      new FormControl<MediaFieldItem[]>(initial, { nonNullable: true }),
    );
    fixture.detectChanges();
    return fixture;
  }

  it('should reject a file with an unsupported type without touching the control', () => {
    const fixture = setup();
    const file = createFile('doc.pdf', 'application/pdf');

    const accepted = fixture.componentInstance.beforeUpload(toNzUploadFile(file, '1'));

    expect(accepted).toBe(false);
    expect(fixture.componentInstance.control().value).toHaveLength(0);
    expect(fixture.componentInstance.chunkUploads()[0].status).toBe('error');
    httpMock.verify();
  });

  it('should reject an image exceeding maxImageSizeMb without touching the control', () => {
    const fixture = setup();
    fixture.componentRef.setInput('maxImageSizeMb', 0.00001);
    const file = createFile('photo.png', 'image/png', 1024);

    const accepted = fixture.componentInstance.beforeUpload(toNzUploadFile(file, '1'));

    expect(accepted).toBe(false);
    expect(fixture.componentInstance.control().value).toHaveLength(0);
    expect(fixture.componentInstance.chunkUploads()[0].status).toBe('error');
  });

  it('should hold a small file directly in the control as a pending item, with no HTTP call', () => {
    const fixture = setup();
    const file = createFile('photo.png', 'image/png');

    const accepted = fixture.componentInstance.beforeUpload(toNzUploadFile(file, '2'));

    expect(accepted).toBe(false);
    expect(fixture.componentInstance.control().value).toEqual([
      { kind: 'pending', uid: '2', file, previewUrl: expect.stringContaining('blob:') },
    ]);
    httpMock.verify();
  });

  it('should immediately chunk-upload a file larger than chunkThresholdMb and append it as uploaded once complete', () => {
    const fixture = setup();
    fixture.componentRef.setInput('chunkThresholdMb', 0.0001);
    const file = createFile('clip.mp4', 'video/mp4', 2048);

    fixture.componentInstance.beforeUpload(toNzUploadFile(file, '3'));
    expect(fixture.componentInstance.chunkUploads()).toHaveLength(1);

    const initReq = httpMock.expectOne('/api/files/uploads');
    initReq.flush({
      code: '200',
      message: 'Success',
      data: { uploadId: 'up-1', chunkSize: 2048, totalChunks: 1 },
    });

    const chunkReq = httpMock.expectOne('/api/files/uploads/up-1/chunks/0');
    chunkReq.flush({
      code: '200',
      message: 'Success',
      data: { uploadId: 'up-1', receivedChunks: 1, totalChunks: 1, completed: true },
    });

    const completeReq = httpMock.expectOne('/api/files/uploads/up-1/complete');
    completeReq.flush({
      code: '200',
      message: 'Success',
      data: {
        id: 42,
        originalFileName: 'clip.mp4',
        fileCategory: 'video',
        contentType: 'video/mp4',
        fileSize: 2048,
        url: '/v1/files/42',
      },
    });

    expect(fixture.componentInstance.chunkUploads()).toHaveLength(0);
    expect(fixture.componentInstance.control().value).toEqual([
      {
        kind: 'uploaded',
        asset: {
          id: 42,
          type: 'video',
          name: 'clip.mp4',
          size: 2048,
          mimeType: 'video/mp4',
          url: '/v1/files/42',
        },
      },
    ]);
  });

  it('should remove a pending file from the control and revoke its preview URL', () => {
    const fixture = setup();
    const file = createFile('photo.png', 'image/png');
    fixture.componentInstance.beforeUpload(toNzUploadFile(file, '4'));
    const pending = fixture.componentInstance.control().value[0];

    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');
    expect(pending.kind).toBe('pending');
    if (pending.kind === 'pending') {
      fixture.componentInstance.onRemovePending(pending);
    }

    expect(fixture.componentInstance.control().value).toEqual([]);
    expect(revokeSpy).toHaveBeenCalled();
  });

  it('should remove an existing asset from the control and emit existingRemoved', () => {
    const asset: MediaAsset = {
      id: 1,
      type: 'image',
      url: '/v1/files/1',
      name: 'a.jpg',
      size: 1,
      mimeType: 'image/jpeg',
    };
    const fixture = setup([{ kind: 'existing', asset }]);

    const emitted = vi.fn();
    fixture.componentInstance.existingRemoved.subscribe(emitted);
    fixture.componentInstance.onRemoveExisting(asset);

    expect(fixture.componentInstance.control().value).toEqual([]);
    expect(emitted).toHaveBeenCalledWith(asset);
  });
});
