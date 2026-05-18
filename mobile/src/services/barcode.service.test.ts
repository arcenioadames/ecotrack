import {
  detectBarcodeFormat,
  validateEAN13,
  validateUPCA,
  validateBarcodeChecksum,
  processBarcodeData,
  normalizeBarcodeForComparison,
  isDuplicateBarcode,
} from './barcode.service';

describe('barcode.service', () => {
  it('detects barcode formats correctly', () => {
    expect(detectBarcodeFormat('4006381333931')).toBe('ean13');
    expect(detectBarcodeFormat('042100005264')).toBe('upca');
    expect(detectBarcodeFormat('CODE128EXAMPLE')).toBe('code128');
    expect(detectBarcodeFormat('😊😊😊')).toBe('unknown');
  });

  it('validates EAN-13 checksum correctly', () => {
    expect(validateEAN13('4006381333931')).toBe(true);
    expect(validateEAN13('4006381333930')).toBe(false);
    expect(validateEAN13('1234567890123')).toBe(false);
  });

  it('validates UPC-A checksum correctly', () => {
    expect(validateUPCA('042100005264')).toBe(true);
    expect(validateUPCA('042100005265')).toBe(false);
    expect(validateUPCA('12345678901')).toBe(false);
  });

  it('validates barcode checksum for supported formats', () => {
    expect(validateBarcodeChecksum('4006381333931')).toBe(true);
    expect(validateBarcodeChecksum('042100005264')).toBe(true);
    expect(validateBarcodeChecksum('CODE128EXAMPLE')).toBe(true);
    expect(validateBarcodeChecksum('😊😊😊')).toBe(false);
  });

  it('processes barcode data and returns normalized BarcodeData', () => {
    const barcodeData = processBarcodeData(' 4006381333931 ');
    expect(barcodeData).not.toBeNull();
    expect(barcodeData).toEqual(
      expect.objectContaining({
        value: '4006381333931',
        format: 'ean13',
      }),
    );
  });

  it('returns null for invalid or unsupported barcodes', () => {
    expect(processBarcodeData('')).toBeNull();
    expect(processBarcodeData('ab')).toBeNull();
    expect(processBarcodeData('4006381333930')).toBeNull();
  });

  it('normalizes values for duplicate comparison', () => {
    expect(normalizeBarcodeForComparison(' abc123 ')).toBe('ABC123');
  });

  it('detects duplicate barcodes within debounce window', () => {
    const previous = {
      value: '4006381333931',
      format: 'ean13' as const,
      timestamp: 1000,
    };
    const current = {
      value: ' 4006381333931 ',
      format: 'ean13' as const,
      timestamp: 1200,
    };

    expect(isDuplicateBarcode(current, previous, 500)).toBe(true);
    expect(isDuplicateBarcode({ ...current, timestamp: 1600 }, previous, 500)).toBe(false);
  });
});
