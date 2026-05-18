import { act, renderHook } from '@testing-library/react';
import { useBarcodeScanner } from './useBarcodeScanner';

describe('useBarcodeScanner', () => {
  beforeEach(() => {
    jest.useFakeTimers({ legacyFakeTimers: false });
    jest.setSystemTime(0);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('processes a valid barcode and calls the callback', async () => {
    const onBarcodeProcessed = jest.fn();
    const { result } = renderHook(() => useBarcodeScanner(500, onBarcodeProcessed));

    await act(async () => {
      result.current.handleBarcodeDetected('4006381333931');
      jest.advanceTimersByTime(500);
    });

    expect(result.current.lastBarcode).toEqual(
      expect.objectContaining({
        value: '4006381333931',
        format: 'ean13',
      }),
    );
    expect(result.current.error).toBeNull();
    expect(onBarcodeProcessed).toHaveBeenCalledTimes(1);
  });

  it('sets an invalid_format error for unsupported barcodes', async () => {
    const { result } = renderHook(() => useBarcodeScanner());

    await act(async () => {
      result.current.handleBarcodeDetected('ab');
      jest.advanceTimersByTime(500);
    });

    expect(result.current.lastBarcode).toBeNull();
    expect(result.current.error).toEqual(
      expect.objectContaining({
        code: 'invalid_format',
      }),
    );
  });

  it('prevents duplicate barcode processing within debounce window', async () => {
    const onBarcodeProcessed = jest.fn();
    const { result } = renderHook(() => useBarcodeScanner(100, onBarcodeProcessed));

    await act(async () => {
      result.current.handleBarcodeDetected('4006381333931');
      jest.advanceTimersByTime(150);
    });

    expect(result.current.lastBarcode?.value).toBe('4006381333931');

    await act(async () => {
      result.current.handleBarcodeDetected('4006381333931');
    });

    expect(result.current.error).toEqual(
      expect.objectContaining({
        code: 'invalid_format',
      }),
    );
    expect(onBarcodeProcessed).toHaveBeenCalledTimes(1);
  });

  it('clears errors and resets state', async () => {
    const { result } = renderHook(() => useBarcodeScanner());

    await act(async () => {
      result.current.handleBarcodeDetected('ab');
      jest.advanceTimersByTime(500);
    });

    expect(result.current.error).not.toBeNull();

    await act(async () => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();

    await act(async () => {
      result.current.reset();
    });

    expect(result.current.lastBarcode).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
