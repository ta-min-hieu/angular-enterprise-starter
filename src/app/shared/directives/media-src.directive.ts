import { Directive, DestroyRef, ElementRef, inject, input } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { ApiService } from '../../core/http/api.service';

// Endpoint tải file (GET /v1/files/{id}) yêu cầu Bearer token nên trình duyệt không thể tải trực
// tiếp qua [src] (thẻ <img>/<video> không gắn được header) — directive này fetch file qua
// ApiService.getBlob() (authInterceptor tự đính token) rồi gán object URL vào src.
@Directive({
  selector: 'img[appMediaSrc], video[appMediaSrc]',
})
export class MediaSrcDirective {
  private readonly apiService = inject(ApiService);
  private readonly elementRef = inject<ElementRef<HTMLImageElement | HTMLVideoElement>>(ElementRef);

  // Path tương đối-từ-root do backend trả về, vd MediaAsset.url = "/v1/files/8".
  readonly appMediaSrc = input.required<string>();

  private objectUrl: string | null = null;

  constructor() {
    // switchMap tự huỷ request cũ khi appMediaSrc đổi trước khi request trước kịp trả lời.
    toObservable(this.appMediaSrc)
      .pipe(
        switchMap((path) => this.apiService.getBlob(path)),
        takeUntilDestroyed(),
      )
      .subscribe((blob) => {
        this.releaseObjectUrl();
        this.objectUrl = URL.createObjectURL(blob);
        this.elementRef.nativeElement.src = this.objectUrl;
      });

    inject(DestroyRef).onDestroy(() => this.releaseObjectUrl());
  }

  private releaseObjectUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }
}
