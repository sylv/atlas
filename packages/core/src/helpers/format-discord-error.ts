import { isPlainObject } from './is-object.js';

export const formatDiscordError = (body: unknown) => {
  if (!isPlainObject(body) || !isPlainObject(body.errors) || !isPlainObject(body.errors)) {
    if (isPlainObject(body) && typeof body.message === 'string') {
      return [body.message];
    }

    const error = new Error('body.errors is not a well-formed error object');
    (error as any).body = body;
    throw error;
  }

  const errors: string[] = [];
  const check = (object: Record<string, any>, keys: string[] = []) => {
    if (Array.isArray(object._errors) && object._errors.length > 0) {
      for (const item of object._errors) {
        const { code, message } = item;
        const path = keys.join('.');
        errors.push(`${path}(${code}): ${message}`);
      }
    }

    for (const [key, value] of Object.entries(object)) {
      if (key === '_errors') continue;
      if (!isPlainObject(value)) continue;
      check(value, [...keys, key]);
    }
  };

  check(body.errors);
  return errors;
};
