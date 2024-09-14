module.exports = {
  extends: ['next/core-web-vitals',
            'plugin:storybook/recommended',
            'plugin:storybook/recommended',
            'plugin:prettier/recommended'],
  plugins: ['prettier'],
  rules: {
    'no-undef': 'error',
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        semi: true,
        useTabs: true,
        tabWidth: 2,
        trailingComma: 'all',
        printWidth: 80,
        bracketSpacing: true,
        arrowParens: 'avoid',
      },
    ],
  },
}