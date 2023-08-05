module.exports = {
  extends: require.resolve('@atlasbot/configs/eslint/node'),
  parserOptions: {
    project: './tsconfig.json',
  },
};
