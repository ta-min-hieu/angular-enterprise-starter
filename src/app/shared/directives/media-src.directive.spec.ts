import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, expect, it, vi } from 'vitest';
import { MediaSrcDirective } from './media-src.directive';

@Component({
  selector: 'app-media-src-host',
  imports: [MediaSrcDirective],
  template: `<img [appMediaSrc]="path" alt="" />`,
})
class HostComponent {
  path = '/v1/files/1';
}

describe('MediaSrcDirective', () => {
  let httpMock: HttpTestingController;

  function setup() {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('should fetch the media as a blob (with auth via the interceptor chain) and set it as an object URL src', () => {
    const fixture = setup();

    const req = httpMock.expectOne('/v1/files/1');
    expect(req.request.method).toBe('GET');
    req.flush(new Blob(['fake image bytes'], { type: 'image/png' }));

    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img.src).toContain('blob:');
  });

  // Không test riêng "đổi path -> fetch lại + revoke URL cũ": hành vi này chỉ là hệ quả của
  // toObservable()+switchMap phản ứng theo input signal (cơ chế sẵn có của Angular, không phải
  // logic tự viết), và thời điểm effect nội bộ của toObservable() được flush trong TestBed
  // (đồng bộ hay bất đồng bộ) không ổn định giữa các lần chạy — test theo hướng đó dễ flaky.
  // Đã verify thủ công hành vi này hoạt động đúng khi chạy app thật (xem browser test).
  it('should revoke the object URL on destroy', () => {
    const fixture = setup();
    httpMock.expectOne('/v1/files/1').flush(new Blob(['a'], { type: 'image/png' }));

    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');
    fixture.destroy();

    expect(revokeSpy).toHaveBeenCalled();
  });
});
