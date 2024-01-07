const { createConfig } = require('./helpers/create-config');

module.exports = createConfig({
  plugins: ['@next/next'],
  extends: ['plugin:@next/next/recommended'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'import/no-default-export': 'off',
    'unicorn/filename-case': 'off',
  },
});
