import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ApiError, parseJson } from '@/lib/http';

describe('parseJson', () => {
  it('throws ApiError on invalid JSON body', async () => {
    const req = new Request('http://localhost', { method: 'POST', body: 'invalid-json' });
    await expect(parseJson(req, z.object({ name: z.string() }))).rejects.toBeInstanceOf(ApiError);
  });
});
