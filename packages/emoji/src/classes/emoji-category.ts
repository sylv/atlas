export class EmojiCategory {
  constructor(
    readonly name: string,
    readonly index: number,
  ) {}

  toJSON() {
    return {
      name: this.name,
      index: this.index,
    };
  }
}
