/**
 * Integration coverage for callable utilities.
 */
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { handleCallableResponse } from '../src/utils';

describe('callable utils integration', () => {
  it('validates request payload and returns typed callable data', async () => {
    const schema = z.object({
      settings: z.object({
        general: z.object({
          theme: z.string(),
        }),
      }),
    });
    const payload = {
      settings: {
        general: { theme: 'dark' },
      },
    };

    const result = await handleCallableResponse(
      Promise.resolve({
        data: {
          status: 200,
          message: 'success.common.ok',
          data: payload,
        },
      }),
      'errors.callable.updateUserSettingsFailed',
      true,
      {
        schema,
        data: payload,
      },
      {
        operationName: 'updateUserSettings',
        requestPayload: payload,
      }
    );

    expect(result).toEqual(payload);
  });
});
