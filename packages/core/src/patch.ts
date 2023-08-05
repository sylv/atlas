declare global {
  interface BigInt {
    toJSON?: () => string;
  }
}

function patchBigInt() {
  if (!BigInt.prototype.toJSON) {
    // eslint-disable-next-line no-extend-native
    BigInt.prototype.toJSON = function toJSON() {
      return this.toString();
    };
  }
}

export { patchBigInt };
