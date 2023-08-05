/** @type {import('eslint').Linter.Config} */
const config = {
  plugins: ['@next/next'],
  extends: [require.resolve('./react.js'), 'plugin:@next/next/recommended'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'import/no-default-export': 'off',
    'unicorn/filename-case': 'off',
  },
};

module.exports = config;
