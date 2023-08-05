/** @type {import('eslint').Linter.Config} */
const config = {
  plugins: ['react', 'react-hooks', 'jsx-a11y'],
  extends: [
    require.resolve('./base.js'),
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/prop-types': 'off',
    'react/display-name': 'off',
  },
};

module.exports = config;
