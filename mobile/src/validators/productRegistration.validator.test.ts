import { productRegistrationSchema } from './productRegistration.validator';

import { describe, expect, it } from '@jest/globals';

describe('productRegistrationSchema', () => {
  it('accepts a valid payload', () => {
    const parsed = productRegistrationSchema.safeParse({
      name: 'Leche',
      barcode: '4006381333931',
      expirationDate: '2026-06-01',
      categoryId: 'cat-1',
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects empty name', () => {
    const parsed = productRegistrationSchema.safeParse({
      name: '  ',
      barcode: '4006381333931',
      expirationDate: '2026-06-01',
      categoryId: 'cat-1',
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    const messages = parsed.error.issues.map((i) => i.message);
    expect(messages.join(' ')).toContain('El nombre debe tener al menos 3 caracteres');
  });

  it('rejects invalid expirationDate', () => {
    const parsed = productRegistrationSchema.safeParse({
      name: 'Leche',
      barcode: '4006381333931',
      expirationDate: 'invalid-date',
      categoryId: 'cat-1',
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    const hasExpirationMessage = parsed.error.issues.some((i) =>
      i.message.toLowerCase().includes('fecha de vencimiento'),
    );
    expect(hasExpirationMessage).toBe(true);
  });
});

