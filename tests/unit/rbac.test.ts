import { describe, expect, it } from 'vitest';
import { hasCentreRole } from '@/lib/rbac';

describe('RBAC', () => {
  it('returns true when role matches', () => {
    expect(hasCentreRole([{ centreId: 'c1', role: 'CM' } as any], 'c1', ['CM'] as any)).toBe(true);
  });
});
