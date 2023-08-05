module.exports = {
  extends: require.resolve('@atlasbot/configs/eslint/portable'),
  parserOptions: {
    project: './tsconfig.json',
  },
};
