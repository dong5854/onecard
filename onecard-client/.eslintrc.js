module.exports = {
	extends: [
		'next/core-web-vitals',
		'plugin:storybook/recommended',
		'plugin:prettier/recommended',
	],
	plugins: ['prettier'],
	globals: {
		React: 'writable',
	},
	rules: {
		'react/jsx-uses-react': 'off',
		'react/react-in-jsx-scope': 'off',
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
};
