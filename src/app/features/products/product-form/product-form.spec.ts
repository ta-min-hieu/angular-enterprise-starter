import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { describe, expect, it, vi } from 'vitest';
import { ProductForm } from './product-form';
import { MediaFieldItem } from '../../../shared/components/file-upload-field/file-upload-field';
import { MediaAsset } from '../../../shared/models/media-asset.model';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

const EMPTY_FORM_VALUE = {
  name: '',
  price: 0,
  stock: 0,
  category: '',
  tags: [],
  description: '',
  status: 'active',
  featured: false,
  releaseDate: null,
  publishedAt: null,
  files: [],
};

describe('ProductForm', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [ProductForm],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNzIcons(REGISTERED_ICONS),
        provideNzI18n(en_US),
        ...provideTranslocoTesting(),
      ],
    });
    return TestBed.createComponent(ProductForm);
  }

  it('should default to an empty form when no product is provided', () => {
    const fixture = setup();
    fixture.detectChanges();

    expect(fixture.componentInstance.form.getRawValue()).toEqual(EMPTY_FORM_VALUE);
  });

  it('should patch the form when editing an existing product, mapping files to existing field items', () => {
    const fixture = setup();
    const releaseDate = new Date(2025, 0, 15);
    const publishedAt = new Date(2025, 0, 15, 9, 0, 0);
    const asset: MediaAsset = {
      id: 7,
      type: 'image',
      name: 'a.jpg',
      size: 1,
      mimeType: 'image/jpeg',
      url: '/v1/files/7',
    };
    fixture.componentRef.setInput('product', {
      id: '1',
      name: 'Bàn phím',
      price: 100000,
      stock: 5,
      category: 'accessories',
      tags: ['new'],
      description: 'Mô tả',
      status: 'active',
      featured: true,
      releaseDate,
      publishedAt,
      files: [asset],
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.form.getRawValue()).toEqual({
      name: 'Bàn phím',
      price: 100000,
      stock: 5,
      category: 'accessories',
      tags: ['new'],
      description: 'Mô tả',
      status: 'active',
      featured: true,
      releaseDate,
      publishedAt,
      files: [{ kind: 'existing', asset }],
    });
  });

  it('should not emit save when the form is invalid', () => {
    const fixture = setup();
    fixture.detectChanges();

    const onSave = vi.fn();
    fixture.componentInstance.save.subscribe(onSave);

    fixture.componentInstance.onSubmit();

    expect(onSave).not.toHaveBeenCalled();
    expect(fixture.componentInstance.form.get('name')?.touched).toBe(true);
  });

  it('should emit save with the product input and no files/fileIds when there are none pending', () => {
    const fixture = setup();
    fixture.detectChanges();

    const onSave = vi.fn();
    fixture.componentInstance.save.subscribe(onSave);
    fixture.componentInstance.form.setValue({
      name: 'Chuột',
      price: 200000,
      stock: 10,
      category: 'accessories',
      tags: ['new'],
      description: '',
      status: 'active',
      featured: false,
      releaseDate: null,
      publishedAt: null,
      files: [],
    });

    fixture.componentInstance.onSubmit();

    expect(onSave).toHaveBeenCalledWith({
      input: {
        name: 'Chuột',
        price: 200000,
        stock: 10,
        category: 'accessories',
        tags: ['new'],
        description: '',
        status: 'active',
        featured: false,
        releaseDate: null,
        publishedAt: null,
      },
      files: [],
      fileIds: [],
    });
  });

  it('should split pending and uploaded field items into files and fileIds on submit', () => {
    const fixture = setup();
    fixture.detectChanges();

    const onSave = vi.fn();
    fixture.componentInstance.save.subscribe(onSave);

    const pendingFile = new File(['x'], 'photo.png', { type: 'image/png' });
    const uploadedAsset: MediaAsset = {
      id: 9,
      type: 'video',
      name: 'clip.mp4',
      size: 10,
      mimeType: 'video/mp4',
      url: '/v1/files/9',
    };
    const items: MediaFieldItem[] = [
      { kind: 'pending', uid: 'a', file: pendingFile, previewUrl: 'blob:a' },
      { kind: 'uploaded', asset: uploadedAsset },
    ];

    fixture.componentInstance.form.patchValue({
      name: 'Chuột',
      category: 'accessories',
      files: items,
    });
    fixture.componentInstance.onSubmit();

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ files: [pendingFile], fileIds: [9] }),
    );
  });

  it('should emit cancelled when cancel is triggered', () => {
    const fixture = setup();
    fixture.detectChanges();

    const onCancel = vi.fn();
    fixture.componentInstance.cancelled.subscribe(onCancel);

    fixture.componentInstance.onCancel();

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should re-emit existingFileRemoved from the file upload field', () => {
    const fixture = setup();
    fixture.detectChanges();

    const asset: MediaAsset = {
      id: 5,
      type: 'image',
      name: 'a.jpg',
      size: 1,
      mimeType: 'image/jpeg',
      url: '/v1/files/5',
    };
    const emitted = vi.fn();
    fixture.componentInstance.existingFileRemoved.subscribe(emitted);

    fixture.componentInstance.onExistingFileRemoved(asset);

    expect(emitted).toHaveBeenCalledWith(asset);
  });
});
