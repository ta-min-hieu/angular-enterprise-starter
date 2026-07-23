import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { TranslocoPipe } from '@jsverse/transloco';
import { UploadService } from '../../../core/http/upload.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { MediaAsset, MediaType } from '../../models/media-asset.model';
import { MediaSrcDirective } from '../../directives/media-src.directive';

export interface ExistingMediaItem {
  readonly kind: 'existing';
  readonly asset: MediaAsset;
}

export interface UploadedMediaItem {
  readonly kind: 'uploaded';
  readonly asset: MediaAsset;
}

export interface PendingMediaItem {
  readonly kind: 'pending';
  readonly uid: string;
  readonly file: File;
  readonly previewUrl: string;
}

// Media đã có trên server (existing/uploaded) hiển thị qua MediaSrcDirective (endpoint tải file cần
// Bearer token). Media pending là File thô, CHƯA upload — giữ nguyên trong control, chỉ gửi lên server
// khi consumer submit form (xem product-form.ts): kiểu "giữ file trong form rồi upload".
export type MediaFieldItem = ExistingMediaItem | UploadedMediaItem | PendingMediaItem;

export interface ChunkUploadItem {
  readonly uid: string;
  readonly name: string;
  readonly previewUrl: string;
  readonly progress: number;
  readonly status: 'uploading' | 'error';
  readonly errorMessage?: string;
}

// Khớp mặc định STORAGE_ALLOWED_IMAGE_TYPES / STORAGE_ALLOWED_VIDEO_TYPES phía backend (web.yaml).
const DEFAULT_ACCEPT =
  'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/x-msvideo,video/webm';
const BYTES_PER_MB = 1024 * 1024;
// File lớn hơn ngưỡng này upload ngay theo từng chunk (kiểu "upload riêng"); từ ngưỡng trở xuống giữ
// nguyên trong form, chỉ gửi kèm request submit (kiểu "giữ file trong form rồi upload").
const DEFAULT_CHUNK_THRESHOLD_MB = 8;

function detectMediaType(mimeType: string): MediaType | null {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  if (mimeType.startsWith('video/')) {
    return 'video';
  }
  return null;
}

@Component({
  selector: 'app-file-upload-field',
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzButtonModule,
    NzIconModule,
    NzProgressModule,
    NzUploadModule,
    NzTooltipModule,
    TranslocoPipe,
    MediaSrcDirective,
  ],
  templateUrl: './file-upload-field.html',
  styleUrl: './file-upload-field.scss',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadField {
  private readonly uploadService = inject(UploadService);
  private readonly i18nService = inject(I18nService);
  private readonly chunkUploadSubscriptions = new Map<string, Subscription>();
  private readonly chunkUploadIds = new Map<string, string>();

  readonly name = input.required<string>();
  readonly label = input.required<string>();
  readonly control = input.required<FormControl<MediaFieldItem[]>>();

  readonly id = input<string>();
  readonly accept = input(DEFAULT_ACCEPT);
  readonly multiple = input(true);
  readonly maxCount = input(10);
  readonly maxImageSizeMb = input(10);
  readonly maxVideoSizeMb = input(200);
  readonly chunkThresholdMb = input(DEFAULT_CHUNK_THRESHOLD_MB);
  readonly errorMessage = input<string>();
  readonly required = input(true);

  readonly existingRemoved = output<MediaAsset>();

  private readonly chunkUploadsSignal = signal<readonly ChunkUploadItem[]>([]);
  readonly chunkUploads = this.chunkUploadsSignal.asReadonly();

  readonly resolvedId = computed(() => this.id() ?? this.name());
  readonly resolvedErrorMessage = computed(
    () =>
      this.errorMessage() ??
      this.i18nService.translate('common.validation.required_field', { field: this.label() }),
  );
  readonly hint = computed(() =>
    this.i18nService.translate('common.upload.hint', {
      imageSize: this.maxImageSizeMb(),
      videoSize: this.maxVideoSizeMb(),
      count: this.maxCount(),
    }),
  );
  readonly canAddMore = computed(
    () => this.control().value.length + this.chunkUploadsSignal().length < this.maxCount(),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.chunkUploadSubscriptions.forEach((subscription) => subscription.unsubscribe());
      this.chunkUploadSubscriptions.clear();
      this.chunkUploadsSignal().forEach((item) => URL.revokeObjectURL(item.previewUrl));
      this.control()
        .value.filter((item): item is PendingMediaItem => item.kind === 'pending')
        .forEach((item) => URL.revokeObjectURL(item.previewUrl));
    });
  }

  readonly beforeUpload = (file: NzUploadFile): boolean => {
    // nz-upload gọi beforeUpload(file, fileList) với `file` LÀ File gốc từ input (chỉ gắn thêm
    // `.uid`), KHÔNG bọc qua `.originFileObj` — field đó chỉ được set sau, trong luồng post() nội
    // bộ mà ta không dùng tới (vì beforeUpload() luôn trả false, tự xử lý upload). Ưu tiên
    // originFileObj nếu có (vd trong test tự dựng NzUploadFile), fallback về chính `file`.
    const raw = file.originFileObj ?? (file as unknown as File);
    if (!raw) {
      return false;
    }

    const type = detectMediaType(raw.type);
    if (!type || !this.accept().split(',').includes(raw.type)) {
      this.pushChunkError(
        file.uid,
        raw.name,
        this.i18nService.translate('common.upload.error_type'),
      );
      return false;
    }

    const maxSizeMb = type === 'image' ? this.maxImageSizeMb() : this.maxVideoSizeMb();
    if (raw.size > maxSizeMb * BYTES_PER_MB) {
      this.pushChunkError(
        file.uid,
        raw.name,
        this.i18nService.translate('common.upload.error_size', { size: maxSizeMb }),
      );
      return false;
    }

    if (!this.canAddMore()) {
      const maxCountMessage = this.i18nService.translate('common.upload.error_max_count', {
        count: this.maxCount(),
      });
      // Chỉ báo lỗi 1 lần cho mỗi lượt chọn nhiều file vượt quá giới hạn, tránh spam nhiều thẻ lỗi
      // giống hệt nhau khi người dùng chọn cùng lúc nhiều file thừa.
      if (!this.chunkUploadsSignal().some((item) => item.errorMessage === maxCountMessage)) {
        this.pushChunkError(file.uid, raw.name, maxCountMessage);
      }
      return false;
    }

    if (raw.size > this.chunkThresholdMb() * BYTES_PER_MB) {
      this.startChunkedUpload(file.uid, raw);
    } else {
      this.addPendingFile(file.uid, raw);
    }

    // Luôn false: widget tự xử lý toàn bộ (giữ file nhỏ trong form hoặc tự chunk-upload file lớn),
    // không dùng cơ chế XHR/nzCustomRequest mặc định của nz-upload.
    return false;
  };

  onRemoveExisting(asset: MediaAsset): void {
    const control = this.control();
    control.setValue(
      control.value.filter((item) => !(item.kind === 'existing' && item.asset.id === asset.id)),
    );
    control.markAsDirty();
    this.existingRemoved.emit(asset);
  }

  onRemoveUploaded(asset: MediaAsset): void {
    const control = this.control();
    control.setValue(
      control.value.filter((item) => !(item.kind === 'uploaded' && item.asset.id === asset.id)),
    );
    control.markAsDirty();
  }

  onRemovePending(item: PendingMediaItem): void {
    URL.revokeObjectURL(item.previewUrl);
    const control = this.control();
    control.setValue(control.value.filter((existing) => existing !== item));
    control.markAsDirty();
  }

  onCancelChunkUpload(item: ChunkUploadItem): void {
    this.chunkUploadSubscriptions.get(item.uid)?.unsubscribe();
    this.chunkUploadSubscriptions.delete(item.uid);

    const uploadId = this.chunkUploadIds.get(item.uid);
    if (uploadId) {
      this.uploadService.abort(uploadId).subscribe({ error: () => undefined });
      this.chunkUploadIds.delete(item.uid);
    }

    this.removeChunkUpload(item.uid);
  }

  private addPendingFile(uid: string, file: File): void {
    const control = this.control();
    const item: PendingMediaItem = {
      kind: 'pending',
      uid,
      file,
      previewUrl: URL.createObjectURL(file),
    };
    control.setValue([...control.value, item]);
    control.markAsDirty();
  }

  private startChunkedUpload(uid: string, file: File): void {
    this.chunkUploadsSignal.update((items) => [
      ...items,
      {
        uid,
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
        status: 'uploading',
      },
    ]);

    const subscription = this.uploadService
      .uploadChunked(file, { onInit: (uploadId) => this.chunkUploadIds.set(uid, uploadId) })
      .subscribe({
        next: (event) => {
          if (event.type === 'progress') {
            this.updateChunkProgress(uid, event.percent);
            return;
          }

          this.completeChunkedUpload(uid, event.data);
        },
        error: () => {
          this.failChunkUpload(uid, this.i18nService.translate('common.upload.error_generic'));
        },
      });

    this.chunkUploadSubscriptions.set(uid, subscription);
  }

  private pushChunkError(uid: string, name: string, errorMessage: string): void {
    this.chunkUploadsSignal.update((items) => [
      ...items,
      { uid, name, previewUrl: '', progress: 0, status: 'error', errorMessage },
    ]);
  }

  private updateChunkProgress(uid: string, percent: number): void {
    this.chunkUploadsSignal.update((items) =>
      items.map((item) => (item.uid === uid ? { ...item, progress: percent } : item)),
    );
  }

  private completeChunkedUpload(uid: string, asset: MediaAsset): void {
    this.releaseChunkPreview(uid);
    this.chunkUploadSubscriptions.delete(uid);
    this.chunkUploadIds.delete(uid);
    this.chunkUploadsSignal.update((items) => items.filter((item) => item.uid !== uid));

    const control = this.control();
    control.setValue([...control.value, { kind: 'uploaded', asset }]);
    control.markAsDirty();
  }

  private failChunkUpload(uid: string, errorMessage: string): void {
    this.chunkUploadSubscriptions.delete(uid);
    this.chunkUploadIds.delete(uid);
    this.chunkUploadsSignal.update((items) =>
      items.map((item) => (item.uid === uid ? { ...item, status: 'error', errorMessage } : item)),
    );
  }

  private removeChunkUpload(uid: string): void {
    this.releaseChunkPreview(uid);
    this.chunkUploadsSignal.update((items) => items.filter((item) => item.uid !== uid));
  }

  private releaseChunkPreview(uid: string): void {
    const item = this.chunkUploadsSignal().find((candidate) => candidate.uid === uid);
    if (item?.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
  }
}
