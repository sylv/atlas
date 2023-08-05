/** @type {import('eslint').Linter.Config} */
const config = {
  extends: require.resolve('./base.js'),
  rules: {
    // You can turn this off if you can't optimize the loop, it's only enabled as a warning
    // to remind you that awaits in loops are bad for performance if you're eg querying redis
    'no-await-in-loop': 'warn',
  },
};

module.exports = config;
