import js from '@eslint/js';
import globals from 'globals';
import tsPlugin from 'typescript-eslint';

export default [
    js.configs.recommended,
    ...tsPlugin.configs.recommended,
    {
        ignores: ['dist/**/*'],
        files: ['**/*.ts'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
            parser: tsPlugin.parser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                project: './tsconfig.json',
            },
        },
        rules: {
            'no-console': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'warn',
        },
    },
];
