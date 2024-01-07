const { createConfig } = require('./helpers/create-config');

module.exports = createConfig({
  plugins: ['es'],
  rules: {
    // safari doesnt like regex lookbehinds
    'es/no-regexp-lookbehind-assertions': 'error',
  },
});
