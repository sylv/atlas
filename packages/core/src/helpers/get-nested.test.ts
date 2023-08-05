import { describe, expect, it } from 'vitest';

/* eslint-disable no-sparse-arrays */
/* eslint-disable unicorn/no-useless-undefined */
import {
  filterUnsafeValues,
  getNested,
  isNullish,
  isSafeReturnValue,
  setNested,
  throwIfRestricted,
} from './get-nested.js';

// todo: https://github.com/mariocasciaro/object-path/blob/master/test.js
// a lot of these tests will be useful here.
const sample = {
  key: 'value',
  number: 'value',
  array: [1, 2, { third: true }],
  map: new Map<string, string>([['key', 'value']]),
  set: new Set<string>(),
  empty: null,
  unset: undefined,
  mixedArray: [
    undefined,
    {},
    0,
    {
      name: 'name',
      value: 'value',
    },
    {
      id: 1,
      value: 'value',
    },
  ],
  arrayOfObjects: [
    {
      name: 'one',
      value: 1,
    },
    {
      name: 'two',
      value: 2,
    },
    {
      name: 'three',
      value: 3,
    },
    {
      name: 'four.five',
      value: 4.5,
    },
    {
      name: null,
      value: null,
    },
  ],
  nested: {
    key: 'value',
  },
};
describe('getNested', () => {
  it('should get nested values by key', () => {
    expect(getNested(sample, 'key')).toBe('value');
    expect(getNested(sample, 'nested.key')).toBe('value');
  });

  it('should support array indexes', () => {
    expect(getNested(sample, 'array.0')).toBe(1);
    expect(getNested(sample, 'array.2.third')).toBe(true);
  });

  it('should support map keys', () => {
    expect(getNested(sample, 'map.key')).toBe('value');
  });

  it('should throw or return undefined when trying to get other values from maps', () => {
    expect(() => getNested(sample, 'map.constructor')).toThrowErrorMatchingSnapshot();
    expect(getNested(sample, 'map.0.id')).toBeUndefined();
  });

  it('should handle invalid keys', () => {
    expect(getNested(sample, 'notAKey')).toBeUndefined();
    expect(getNested(sample, 'set.key')).toBeUndefined();
  });

  it('should not expose special properties', () => {
    expect(() => getNested(Map, 'prototype')).toThrowErrorMatchingSnapshot();
    expect(() => getNested(Map, '__proto__')).toThrowErrorMatchingSnapshot();
    expect(() => getNested(Map, 'constructor')).toThrowErrorMatchingSnapshot();
    expect(() => getNested(sample, 'nested.constructor')).toThrowErrorMatchingSnapshot();
    expect(getNested(1, 'toLocaleString')).toBeUndefined();
    expect(getNested(1, 'toString')).toBeUndefined();
    expect(getNested(sample, 'toString')).toBeUndefined();
  });

  it('should support array find operations', () => {
    // old syntax
    expect(getNested(sample, 'arrayOfObjects.[name:two].value')).toBe(2);

    // new syntax
    expect(getNested(sample, 'arrayOfObjects[name:two].value')).toBe(2);
    expect(getNested(sample, 'arrayOfObjects[value:2].name')).toBe('two');
    expect(getNested(sample, 'arrayOfObjects[name:null].value')).toBeUndefined();
    expect(getNested(sample, 'arrayOfObjects[name:].value')).toBeNull();
    expect(getNested(sample, 'arrayOfObjects[name].value')).toBeNull();
    expect(getNested(sample, 'mixedArray[id:1].value')).toBe('value');

    // these both do the same thing
    expect(getNested(sample, 'arrayOfObjects.[1].name')).toBe('two');
    expect(getNested(sample, 'arrayOfObjects.1.name')).toBe('two');
  });

  it('should not split on dots in array find brackets []', () => {
    expect(getNested(sample, 'arrayOfObjects[name:four.five].value')).toBe(4.5);
    expect(getNested(sample, 'arrayOfObjects.[name:four.five].value')).toBe(4.5);
  });

  it('should return null values', () => {
    expect(getNested(sample, 'empty')).toBeNull();
  });

  it('should get array-only input values by index', () => {
    expect(getNested([0, 1, 2], '0')).toBe(0);
    expect(getNested([0, 1, 2], '2')).toBe(2);
  });

  it('should allow updating arrays by reference', () => {
    const array = [[]];
    const target = getNested(array, '0') as any[];
    target.push('test');
    expect(array).toEqual([['test']]);
  });
});

describe('filterUnsafeValues', () => {
  class MyClass {}
  const inst = new MyClass();
  it('should return undefined for rich structures', () => {
    expect(filterUnsafeValues(inst)).toBeUndefined();
  });

  it('should filter rich values from objects', () => {
    expect(filterUnsafeValues({ a: 1, b: { c: 2, inst } })).toStrictEqual({ a: 1, b: { c: 2 } });
  });

  it('should filter rich structures in arrays', () => {
    expect(filterUnsafeValues([inst, { id: 1 }])).toEqual([{ id: 1 }]);
  });
});

describe('throwIfRestricted', () => {
  it('should throw if key is a restricted property', () => {
    expect(() => {
      throwIfRestricted('constructor');
    }).toThrowErrorMatchingSnapshot();
    expect(() => {
      throwIfRestricted('__proto__');
    }).toThrowErrorMatchingSnapshot();
  });

  it('should ignore case', () => {
    expect(() => {
      throwIfRestricted('CONSTRUCTOR');
    }).toThrowErrorMatchingSnapshot();
  });

  it('should trim whitespace', () => {
    expect(() => {
      throwIfRestricted(' constructor ');
    }).toThrowErrorMatchingSnapshot();
  });
});

describe('isNullish', () => {
  it('should return true for nullish values', () => {
    expect(isNullish(null)).toBe(true);
    expect(isNullish('')).toBe(true);
    expect(isNullish(undefined)).toBe(true);
  });

  it('should return false for other values', () => {
    expect(isNullish(0)).toBe(false);
    expect(isNullish(false)).toBe(false);
    expect(isNullish(true)).toBe(false);
    expect(isNullish(Number.NaN)).toBe(false);
    expect(isNullish(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isNullish('string')).toBe(false);
    expect(isNullish(Symbol('symbol'))).toBe(false);
    expect(isNullish(new Map())).toBe(false);
    expect(isNullish(new Set())).toBe(false);
    expect(isNullish(new Date())).toBe(false);
    expect(isNullish(/regex/)).toBe(false);
    expect(isNullish(() => {})).toBe(false);
  });
});

describe('isSafeReturnValue', () => {
  it('should return false for unsafe values', () => {
    class MyClass {}
    const inst = new MyClass();
    expect(isSafeReturnValue(inst)).toBe(false);
    expect(isSafeReturnValue(() => 'Hi')).toBe(false);
  });

  it('should return true for safe values', () => {
    expect(isSafeReturnValue(0)).toBe(true);
    expect(isSafeReturnValue({ hi: true })).toBe(true);
    expect(isSafeReturnValue([{ hi: true }])).toBe(true);
  });
});

describe('setNested', () => {
  it('should set nested object values', () => {
    let target = {};
    setNested(target, 'key', 'value');
    expect(target).toStrictEqual({ key: 'value' });

    target = {};
    setNested(target, 'key.nested', 'value');
    expect(target).toStrictEqual({ key: { nested: 'value' } });
    setNested(target, 'key.other', 'value');
    expect(target).toStrictEqual({ key: { nested: 'value', other: 'value' } });
  });

  it('should set array values', () => {
    let target = {};
    setNested(target, 'key.0', 'value');
    expect(target).toStrictEqual({ key: ['value'] });

    target = {};
    setNested(target, 'key.0.nested', 'value');
    expect(target).toStrictEqual({ key: [{ nested: 'value' }] });

    target = [];
    setNested(target, '0', 'value');
    expect(target).toStrictEqual(['value']);

    target = [];
    setNested(target, '2', 'value');
    expect(target).toStrictEqual([, , 'value']);

    target = [];
    setNested(target, '0.0', 'value');
    expect(target).toStrictEqual([['value']]);
  });

  it('should set nested values by find syntax', () => {
    const target = { items: [{ id: 1 }, { id: 2 }] };
    setNested(target, 'items.[id:1].name', 'one');
    expect(target).toStrictEqual({ items: [{ id: 1, name: 'one' }, { id: 2 }] });
  });

  it('should overwrite keys that are incompatible', () => {
    let target: Record<string, any> = { key: 'value' };
    setNested(target, 'key.nested', 'value');
    expect(target).toStrictEqual({ key: { nested: 'value' } });

    target = { key: 'value' };
    setNested(target, 'key.0', 'value');
    expect(target).toStrictEqual({ key: ['value'] });

    target = { key: ['value'] };
    setNested(target, 'key.0.nested', 'value');
    expect(target).toStrictEqual({ key: [{ nested: 'value' }] });

    setNested(target, 'key.[nested:value]', 'value');
    expect(target).toStrictEqual({ key: ['value'] });
  });

  it('should treat snowflakes as regular keys', () => {
    // tests for {=data.111372124383428608;value} which in the past
    // would be treated as a array index.
    const target = {};
    setNested(target, 'key.111372124383428608', 'value');
    expect(target).toStrictEqual({ key: { '111372124383428608': 'value' } });
  });

  it('should not throw an error with bad syntax', () => {
    const target = {};
    setNested(target, 'key..', 'value');
    expect(target).toStrictEqual({ key: 'value' });
  });
});
