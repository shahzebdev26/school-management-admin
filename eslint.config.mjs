import eslint from '@eslint/js'
import next from 'eslint-config-next/core-web-vitals'
import prettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

const BAN_TYPE_ASSERTION = {
  selector: 'TSAsExpression:not([typeAnnotation.typeName.name="const"])',
  message:
    'Type assertions are banned (docs/typescript.md). Parse with Zod, narrow, or use a type guard. `as const` and `satisfies` are allowed.',
}

const BAN_REACT_FC = {
  selector: 'TSTypeReference > TSQualifiedName[left.name="React"][right.name="FC"]',
  message:
    'React.FC is banned (docs/typescript.md). Annotate the props parameter directly instead.',
}

const BAN_HARDCODED_COLOUR = {
  selector: 'Literal[value=/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]',
  message:
    'Hardcoded colours are banned (docs/styling.md). Use a semantic theme token.',
}

const BAN_PROCESS_ENV = {
  selector: 'MemberExpression[object.name="process"][property.name="env"]',
  message:
    'Only src/lib/env.ts may read process.env (docs/architecture.md). Import the validated `env` object instead.',
}

export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      'next-env.d.ts',
      'src/lib/api/generated/**',
      'public/sw.js',
    ],
  },

  eslint.configs.recommended,
  ...next,

  {
    files: ['**/*.{ts,tsx,mts}'],
    extends: [...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 60, skipBlankLines: true, skipComments: true }],
      'max-params': ['error', 3],
      'max-depth': ['error', 3],
      complexity: ['error', 10],
      'max-nested-callbacks': ['error', 3],

      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': true,
          'ts-expect-error': true,
          'ts-nocheck': true,
          'ts-check': false,
        },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      'no-restricted-syntax': [
        'error',
        BAN_TYPE_ASSERTION,
        BAN_REACT_FC,
        BAN_HARDCODED_COLOUR,
        BAN_PROCESS_ENV,
      ],

      'no-console': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-param-reassign': ['error', { props: true }],
      'prefer-const': 'error',
      'object-shorthand': 'error',
    },
  },

  {
    files: ['src/lib/env.ts'],
    rules: {
      'no-restricted-syntax': ['error', BAN_TYPE_ASSERTION, BAN_REACT_FC, BAN_HARDCODED_COLOUR],
    },
  },

  {
    files: ['next.config.ts'],
    rules: {
      'no-restricted-syntax': ['error', BAN_TYPE_ASSERTION, BAN_REACT_FC, BAN_HARDCODED_COLOUR],
    },
  },

  {
    files: ['src/app/manifest.webmanifest/route.ts'],
    rules: {
      'no-restricted-syntax': ['error', BAN_TYPE_ASSERTION, BAN_REACT_FC, BAN_PROCESS_ENV],
    },
  },

  {
    files: ['src/**/__tests__/**/*.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    rules: {
      'max-lines-per-function': 'off',
      'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }],
      'max-nested-callbacks': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },

  prettier,
)
