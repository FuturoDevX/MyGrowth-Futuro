import { describe, expect, it } from 'vitest';
import { checkRateLimit } from '@/lib/rate-limit';

describe('checkRateLimit', () => {
  it('caps requests within window', () => {
    const key = 'test-key';
    expect(checkRateLimit(key, 2, 10000)).toBe(true);
    expect(checkRateLimit(key, 2, 10000)).toBe(true);
    expect(checkRateLimit(key, 2, 10000)).toBe(false);
  });
});
