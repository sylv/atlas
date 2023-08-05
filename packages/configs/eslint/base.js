/** @type {import('eslint').Linter.Config} */
const config = {
  parser: '@typescript-eslint/parser',
  plugins: ['import', 'unicorn', 'sonarjs', '@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:unicorn/recommended', 'plugin:@typescript-eslint/recommended'],
  ignorePatterns: ['**/*.test.ts', '**/*.{cjs,mjs,js}'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: true,
        fixStyle: 'inline-type-imports',
      },
    ],
    // i already prefer "unknown", but sometimes "any" is necessary
    '@typescript-eslint/no-explicit-any': 'off',
    // if im doing this its because i know what im doing
    '@typescript-eslint/no-non-null-assertion': 'off',
    // handled by typescript
    '@typescript-eslint/no-unused-vars': 'off',
    'no-empty': 'off',
    'unicorn/no-abusive-eslint-disable': 'off',
    'sonarjs/cognitive-complexity': ['warn', 25],
    'sonarjs/max-switch-cases': 'off',
    'sonarjs/no-all-duplicated-branches': 'error',
    'sonarjs/no-collapsible-if': 'error',
    'sonarjs/no-collection-size-mischeck': 'warn',
    'sonarjs/no-duplicated-branches': 'error',
    'sonarjs/no-element-overwrite': 'error',
    'sonarjs/no-identical-conditions': 'error',
    'sonarjs/no-identical-expressions': 'error',
    'sonarjs/no-identical-functions': 'error',
    'sonarjs/no-ignored-return': 'error',
    'sonarjs/no-nested-switch': 'off',
    'sonarjs/no-one-iteration-loop': 'error',
    'sonarjs/no-redundant-boolean': 'error',
    'sonarjs/no-small-switch': 'error',
    'sonarjs/no-unused-collection': 'error',
    'sonarjs/no-useless-catch': 'error',
    'sonarjs/non-existent-operator': 'warn',
    'sonarjs/prefer-immediate-return': 'warn',
    'sonarjs/prefer-object-literal': 'error',
    // usually small switches are used in places where they'll be big in the future
    'sonarjs/no-small-switch': 'off',
    // annoying, makes code unreadable
    'unicorn/prefer-ternary': 'off',
    'unicorn/import-style': 'off', // personal preference
    'unicorn/no-useless-undefined': 'off', // breaks some types
    // prettier conflict
    'unicorn/number-literal-case': 'off',
    // breaks with a lot of tooling
    'unicorn/prefer-node-protocol': 'off',
    // annoying, its useful sometimes
    'unicorn/no-array-reduce': 'off',
    // conflicts with prettier
    'unicorn/no-nested-ternary': 'off',
    // most of the time this config is used with node apps where process.exit() is fine/necessary
    'unicorn/no-process-exit': 'off',
    // mostly just butchers numbers that dont need it
    'unicorn/numeric-separators-style': 'off',
    // personally classes are groups of methods, objects dont fit the bill
    'unicorn/no-static-only-class': 'off',
    // discord bots use a lot of bitwise operations
    'unicorn/prefer-math-trunc': 'off',
    // "null" and "undefined" are two different things and are used as such
    'unicorn/no-null': 'off',
    // this mostly just butchers already clean code. i know when to use abbreviations and when not to.
    'unicorn/prevent-abbreviations': 'off',
    'import/newline-after-import': 'warn',
    'import/no-anonymous-default-export': 'error',
    'import/no-default-export': 'warn',
    'import/no-extraneous-dependencies': 'warn',
    'import/no-unused-modules': 'warn',
    // utterly destroys git diffs
    // 'import/order': [
    //   'warn',
    //   {
    //     alphabetize: {
    //       order: 'asc',
    //     },
    //     groups: [['builtin', 'external', 'internal'], ['unknown', 'parent', 'sibling'], 'index'],
    //     'newlines-between': 'ignore',
    //   },
    // ],
  },
  overrides: [
    {
      files: ['**/*.test.{js,jsx,ts,tsx}'],
      rules: {
        '@typescript-eslint/no-empty-function': 'off',
        'sonarjs/no-identical-expressions': 'off',
      },
    },
    {
      files: ['**/migrations/*'],
      rules: {
        'unicorn/filename-case': 'off',
      },
    },
  ],
};

module.exports = config;
