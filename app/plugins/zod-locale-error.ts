import { z as zod } from 'zod';

import type {
  ZodInvalidFormatIssue,
  ZodLocaleErrorMap,
  ZodTooBigIssue,
  ZodTooSmallIssue,
} from '~/types/zodLocaleError';

function createTooSmallErrorMessage(zodIssue: ZodTooSmallIssue): string {
  if (zodIssue.origin === 'string') {
    if (zodIssue.minimum === 1) {
      return 'Поле обязательно';
    }

    return `Минимум ${String(zodIssue.minimum)} символов`;
  }

  if (zodIssue.origin === 'number') {
    return `Минимум ${String(zodIssue.minimum)}`;
  }

  if (zodIssue.origin === 'array') {
    return `Минимум ${String(zodIssue.minimum)} элементов`;
  }

  return 'Слишком маленькое значение';
}

function createTooBigErrorMessage(zodIssue: ZodTooBigIssue): string {
  if (zodIssue.origin === 'string') {
    return `Максимум ${String(zodIssue.maximum)} символов`;
  }

  if (zodIssue.origin === 'number') {
    return `Максимум ${String(zodIssue.maximum)}`;
  }

  if (zodIssue.origin === 'array') {
    return `Максимум ${String(zodIssue.maximum)} элементов`;
  }

  return 'Слишком большое значение';
}

function createInvalidFormatErrorMessage(zodIssue: ZodInvalidFormatIssue): string {
  if (zodIssue.format === 'email') {
    return 'Некорректный email';
  }

  return 'Неверный формат';
}

const createRussianZodErrorMessage: ZodLocaleErrorMap = (zodIssue) => {
  if (zodIssue.code === 'invalid_type') {
    if (zodIssue.input === null || zodIssue.input === undefined) {
      return 'Поле обязательно';
    }

    return 'Неверный тип значения';
  }

  if (zodIssue.code === 'too_small') {
    return createTooSmallErrorMessage(zodIssue);
  }

  if (zodIssue.code === 'too_big') {
    return createTooBigErrorMessage(zodIssue);
  }

  if (zodIssue.code === 'invalid_format') {
    return createInvalidFormatErrorMessage(zodIssue);
  }

  return 'Некорректное значение';
};

export default defineNuxtPlugin(() => {
  zod.config({
    localeError: createRussianZodErrorMessage,
  });
});
