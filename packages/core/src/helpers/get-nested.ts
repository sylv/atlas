import { NUMBER_REGEX } from '../constants.js';
import { isPlainObject } from './is-object.js';
import { isPrimitive } from './is-primitive.js';

export enum PathType {
  KEY,
  INDEX,
  FIND,
}

export interface PathPartKey {
  type: PathType.KEY;
  key: string;
}

export interface PathPartFind {
  type: PathType.FIND;
  key: string;
  value?: string | null;
}

export interface PathPartIndex {
  type: PathType.INDEX;
  index: number;
}

export type PathPart = PathPartKey | PathPartFind | PathPartIndex;
export const RESTRICTED_KEYS = new Set<string>(['__proto__', 'prototype', 'constructor']);
export const INDEX_REGEX = /^\d{1,5}$/u;
export const FIND_REGEX = /(\[[^\]]+\])/gu;

export function* parsePath(path: string): Generator<PathPart> {
  // we do this in two parts, objects first, because otherwise
  // items.[name:channel.id] would split into ["items", "[name:channel", "id]"]
  // which is obviously not what anyone wants. so we split [] then dots
  const splitFinds = path.split(FIND_REGEX);
  const split = splitFinds.flatMap((part, index) => {
    if (part.startsWith('[') && part.endsWith(']')) return part;
    if (part.endsWith('.') && splitFinds[index + 1] && splitFinds[index + 1].startsWith('[')) {
      // old syntax was items.[name:channel.id] because of parsing limitations,
      // new syntax is items[name:channel.id] so we strip the unnecessary .
      part = part.slice(0, -1);
    }

    return part.split('.');
  });

  for (const part of split) {
    if (!part) continue;
    const isArrayFind = part.startsWith('[') && part.endsWith(']');
    if (isArrayFind) {
      const [key, value] = part.slice(1, -1).split(':');
      if (NUMBER_REGEX.test(key) && !value) {
        yield { type: PathType.INDEX, index: Number(key) };
        continue;
      }

      throwIfRestricted(key);
      yield { type: PathType.FIND, key, value };
      continue;
    }

    const isIndex = INDEX_REGEX.test(part);
    if (isIndex) {
      const value = Number(part);
      if (value <= 50000) {
        yield { type: PathType.INDEX, index: Number(part) };
        continue;
      }
    }

    throwIfRestricted(part);
    yield { type: PathType.KEY, key: part };
  }
}

export function throwIfRestricted(key: string) {
  if (RESTRICTED_KEYS.has(key.trim().toLowerCase())) {
    throw new Error(`Attempt to access restricted key.`);
  }
}

export function isNullish(object: unknown): boolean {
  if (object === undefined) return true;
  if (object === null || object === '') return true;
  return false;
}

// todo: this is probably expensive and definitely overkill.
// a better approach might be force tags to return
// explicitObject(value) which adds a symbol that marks it as safe,
// then we check for that or something.
export function filterUnsafeValues(value: unknown): unknown {
  if (isPlainObject(value)) {
    const clean: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      const result = filterUnsafeValues(value[key]);
      if (result !== undefined) clean[key] = result;
    }

    return clean;
  } else if (Array.isArray(value)) {
    const clean = [];
    let encounteredUnsafe = false;
    for (const item of value) {
      const result = filterUnsafeValues(item);
      if (result === undefined || result === null) {
        encounteredUnsafe = true;
        continue;
      }

      clean.push(result);
    }

    if (!encounteredUnsafe) {
      // this is necessary to keep the reference, required to pass updating by reference tests
      // an alternative might be mutating the original array, but that seems like a bad approach.
      return value;
    }

    return clean;
  } else if (isPrimitive(value)) {
    return value;
  }
}

export function isSafeReturnValue(value: unknown) {
  if (isPrimitive(value)) return true;
  if (isPlainObject(value, true)) return true;
  return false;
}

export const getNested = (object: unknown, path: string): unknown | undefined => {
  if (!path) return;

  let currentValue = object;
  for (const part of parsePath(path)) {
    if (isNullish(currentValue)) return currentValue;
    if (!isPlainObject(currentValue, true) && !(currentValue instanceof Map)) {
      return;
    }

    if (currentValue === Reflect.getPrototypeOf({})) {
      // we shouldnt really ever get here as we should discard prototype keys
      // but just in case we do, we throw an error.
      throw new Error(`Attempt to access Object.prototype`);
    }

    switch (part.type) {
      case PathType.KEY: {
        if (Array.isArray(currentValue)) return;
        currentValue = currentValue instanceof Map ? currentValue.get(part.key) : currentValue[part.key];
        break;
      }
      case PathType.INDEX: {
        if (!Array.isArray(currentValue)) return;
        currentValue = currentValue[part.index];
        break;
      }
      case PathType.FIND: {
        if (!Array.isArray(currentValue)) return;
        currentValue = currentValue.find((element) => {
          const value = getNested(element, part.key);
          // this is intentionally "eqeq" and not "eqeqeq"
          // as it will compare numbers and strings "properly"
          if (part.value == value) return true;
          // [find] with no value checks for nullish values
          if (!part.value && isNullish(value)) return true;
        });

        break;
      }
    }
  }

  if (!isSafeReturnValue(currentValue)) return;
  return filterUnsafeValues(currentValue);
};

function shouldReplace(value: unknown, nextPart: PathPart) {
  if (nextPart.type === PathType.KEY) {
    if (!isPlainObject(value)) return true;
    return false;
  }

  if (!Array.isArray(value)) return true;
  return false;
}

export const setNested = (target: unknown, key: string, value: unknown): void => {
  if (isNullish(target)) return;

  let currentValue = target;
  const parts = [...parsePath(key)];
  for (let partIndex = 0; partIndex < parts.length; partIndex++) {
    if (!isPlainObject(currentValue, true) && !(currentValue instanceof Map)) {
      return;
    }

    const part = parts[partIndex];
    const nextPart: PathPart | undefined = parts[partIndex + 1];
    switch (part.type) {
      case PathType.KEY: {
        if (Array.isArray(currentValue)) return;
        if (currentValue instanceof Map) {
          if (!nextPart) {
            currentValue.set(part.key, value);
            return;
          }

          let mapValue = currentValue.get(part.key);
          if (mapValue === undefined) {
            mapValue = nextPart.type === PathType.KEY ? {} : [];
            currentValue.set(part.key, mapValue);
          }

          currentValue = mapValue;
        } else {
          if (!nextPart) {
            currentValue[part.key] = value;
            return;
          }

          let keyValue = currentValue[part.key];
          if (keyValue === undefined || shouldReplace(keyValue, nextPart)) {
            keyValue = nextPart.type === PathType.KEY ? {} : [];
            currentValue[part.key] = keyValue;
          }

          currentValue = keyValue;
        }

        break;
      }
      case PathType.INDEX: {
        if (!Array.isArray(currentValue)) return;
        if (!nextPart) {
          currentValue[part.index] = value;
          return;
        }

        let indexValue = currentValue[part.index];
        if (indexValue === undefined || shouldReplace(indexValue, nextPart)) {
          indexValue = nextPart.type === PathType.KEY ? {} : [];
          currentValue[part.index] = indexValue;
        }

        currentValue = indexValue;
        break;
      }
      case PathType.FIND: {
        if (!Array.isArray(currentValue)) return;
        const valueIndex = currentValue.findIndex((element) => {
          const value = getNested(element, part.key);
          // this is intentionally "eqeq" and not "eqeqeq"
          // as it will compare numbers and strings "properly"
          if (part.value == value) return true;
          // [find] with no value checks for nullish values
          if (!part.value && isNullish(value)) return true;
          return false;
        });

        if (valueIndex === -1) {
          if (!nextPart) {
            currentValue.push(value);
            return;
          }

          const replacement = nextPart.type === PathType.KEY ? {} : [];
          currentValue.push(replacement);
          currentValue = replacement;
        } else {
          if (!nextPart) {
            currentValue[valueIndex] = value;
            return;
          }

          let valueValue = currentValue[valueIndex];
          if (valueValue === undefined || shouldReplace(valueValue, nextPart)) {
            valueValue = nextPart.type === PathType.KEY ? {} : [];
            currentValue[valueIndex] = valueValue;
          }

          currentValue = valueValue;
        }
      }
    }
  }
};
