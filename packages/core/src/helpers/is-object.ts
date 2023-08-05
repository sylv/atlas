/**
 * Check whether a value is a plain object.
 * @example
 * isPlainObject({}) // true
 * isPlainObject(new MyClass()) // false
 * isPlainObject(null) // false
 * isPlainObject([]) // false
 * isPlainObject([], true) // true
 */
export const isPlainObject = (input: unknown, allowArrays = false): input is Record<string, unknown> => {
  if (!isSpecialObject(input, allowArrays)) return false;
  if (!input.constructor || input.constructor.name !== 'Object') {
    if (allowArrays && input.constructor.name === 'Array') return true;
    return false;
  }

  return true;
};

/**
 * Check whether a value is a plain or special object.
 * isSpecialObject({}) // true
 * isSpecialObject(new MyClass()) // true
 * isSpecialObject(null) // false
 * isSpecialObject([]) // false
 * isSpecialObject([], true) // true
 */
export const isSpecialObject = (input: unknown, allowArrays = false): input is Record<string, unknown> => {
  if (typeof input !== 'object') return false;
  if (input === null) return false;
  if (Array.isArray(input) && !allowArrays) return false;
  return true;
};
