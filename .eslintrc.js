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
                'node': true, // Node.js environment for .eslintrc.js and .eslintrc.cjs files
            },
            'files': [
                '.eslintrc.{js,cjs}', // Apply overrides to .eslintrc.js and .eslintrc.cjs files
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
        'react/react-in-jsx-scope': 'off', // Disable warning for missing React import in JSX
        'react/jsx-uses-react': 'off', // Disable warning for unused React in JSX
        'react/jsx-uses-vars': 'error', // Enable error for unused variables in JSX
        '@typescript-eslint/no-unused-vars': ['warn', { 'vars': 'all', 'args': 'after-used', 'ignoreRestSiblings': false }], // Enable warning for unused variables in TypeScript
        '@typesctipt-eslint/explicit-module-boundary-types': 'off', // Disable warning for missing explicit return types in TypeScript

        'no-else-return': ['error', {'allowElseIf': false }], // Require return statements in if-else blocks
        'no-eq-null': 'error', // Disallow equality comparisons with null
        'no-global-assign': ['error'], // Disallow global variable assignments
        'no-undefined': 'error', // Disallow use of undefined variable
        'no-unused-vars': ['error'], // Disallow unused variables
        'no-use-before-define': ['error'], // Disallow use of variables before they are defined
        'computed-property-spacing': ['error', 'never'], // Disallow spaces inside computed properties
        'no-console': ['warn'], // Warn when using console.log

        'jsx-quotes': ['error'], // Enforce double quotes in JSX attributes
        'quotes': ['error', 'single', {'avoidEscape': true}], // Enforce single quotes
        'comma-style': ['error', 'last'], // Enforce comma placement style
        'indent': ['error', 4], // Enforce 4-space indentation
        'semi': ['error'], // Require semicolons
        'no-multi-spaces': ['warn', {
            'exceptions':
            {
                'Property': true,
                'VariableDeclarator': true,
                'ImportDeclaration': true
            }}
        ], // Warn for multiple consecutive spaces, except in certain cases
    },
    'settings': {
        'react': {
            'version': 'detect', // Detect React version
        },
    },
};
