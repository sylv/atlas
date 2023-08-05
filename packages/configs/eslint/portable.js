/** @type {import('eslint').Linter.Config} */
const config = {
  extends: require.resolve('./base.js'),
  plugins: ['es'],
  rules: {
    // safari doesnt like regex lookbehinds
    'es/no-regexp-lookbehind-assertions': 'error',
  },
};

module.exports = config;
