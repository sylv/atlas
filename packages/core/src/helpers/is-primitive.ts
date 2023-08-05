export const isPrimitive = (input: unknown): input is string | number | boolean => {
  if (input === null || input === undefined) return true;
  if (typeof input === 'number' || typeof input === 'boolean' || typeof input === 'string') return true;
  return false;
};
