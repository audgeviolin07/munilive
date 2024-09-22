module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
      'plugin:@typescript-eslint/recommended',
      'next/core-web-vitals',
    ],
    rules: {
      '@typescript-eslint/no-empty-interface': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  };