const { createConfig } = require('./helpers/create-config');

module.exports = createConfig({
  plugins: ['react', 'react-hooks', 'jsx-a11y'],
  extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended', 'plugin:jsx-a11y/recommended'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/prop-types': 'off',
    'react/display-name': 'off',
  },
});
