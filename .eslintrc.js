module.exports = {
    'env': {
        'browser': true,
        'es2021': true,
        'node': true,
    },
    'extends': [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
    ],
    'overrides': [
        {
            'env': {
                'node': true,
            },
            'files': [
                '.eslintrc.{js,cjs}',
            ],
            'parserOptions': {
                'sourceType': 'script',
            },
        },
    ],
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'ecmaFeatures': {
            'jsx': true,
        },
        'ecmaVersion': 'latest',
        'sourceType': 'module',
    },
    'plugins': [
        '@typescript-eslint',
        'react'
    ],
    'rules': {
        'react/react-in-jsx-scope': 'off',
        'react/jsx-uses-react': 'off',
        'react/jsx-uses-vars': 'error',
        '@typescript-eslint/no-unused-vars': ['warn', { 'vars': 'all', 'args': 'after-used', 'ignoreRestSiblings': false }],
        '@typesctipt-eslint/explicit-module-boundary-types': 'off',

        'no-else-return': ['error', {'allowElseIf': false }],
        'no-eq-null': 'error',
        'no-global-assign': ['error'],
        'no-undef': ['error'],
        'no-undefined': 'error',
        'no-unused-vars': ['error'],
        'no-use-before-define': ['error'],
        'computed-property-spacing': ['error', 'never'],
        'jsx-quotes': ['error'],
        'no-console': ['warn'],
        'quotes': ['error', 'single', {'avoidEscape': true}],
        'comma-style': ['error', 'last'],
        'indent': ['error', 4],
        'semi': ['error'],
        'no-multi-spaces': ['warn', {
            'exceptions':
            {
                'Property': true,
                'VariableDeclarator': true,
                'ImportDeclaration': true
            }}],
    },
    'settings': {
        'react': {
            'version': 'detect',
        },
    },
};
