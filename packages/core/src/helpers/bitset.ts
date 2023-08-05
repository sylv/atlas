export type BitwiseInput = number | bigint | string;
const AdministratorPermissionMask = 8n;

export function testBit(value: BitwiseInput, mask: BitwiseInput): boolean {
  const maskAsBigint = BigInt(mask);
  return (BigInt(value) & BigInt(mask)) === maskAsBigint;
}

export function setBit<Type extends BitwiseInput>(value: Type, mask: BitwiseInput): Type {
  return serialize(BigInt(value) | BigInt(mask), value);
}

export function clearBit<Type extends BitwiseInput>(value: Type, mask: BitwiseInput): Type {
  return serialize(BigInt(value) & ~BigInt(mask), value);
}

/**
 * Tests whether the bitset has the given permission.
 * Will return true if the user has administrator permissions without explicitly having
 * the given permission, so this is useful for "can the user do x" permission checks.
 */
export function testPermission(value: BitwiseInput, permission: BitwiseInput): boolean {
  if (testBit(value, AdministratorPermissionMask)) return true;
  return testBit(value, permission);
}

function serialize<Type extends BitwiseInput>(value: bigint, as: Type): Type {
  if (typeof as === 'string') return value.toString() as Type;
  if (typeof as === 'number') {
    if (as > Number.MAX_SAFE_INTEGER) throw new Error('Too big to serialize as a number');
    return Number(value) as Type;
  }

  return value as Type;
}
