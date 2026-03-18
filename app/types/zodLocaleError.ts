import type { z } from 'zod';

export type ZodLocaleErrorMap = NonNullable<ReturnType<typeof z.config>['localeError']>;
export type ZodLocaleErrorIssue = Parameters<ZodLocaleErrorMap>[0];

export type ZodTooSmallIssue = Extract<ZodLocaleErrorIssue, { code: 'too_small' }>;
export type ZodTooBigIssue = Extract<ZodLocaleErrorIssue, { code: 'too_big' }>;
export type ZodInvalidFormatIssue = Extract<ZodLocaleErrorIssue, { code: 'invalid_format' }>;

