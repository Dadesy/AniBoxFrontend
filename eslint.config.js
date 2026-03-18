import { createConfigForNuxt } from '@nuxt/eslint-config/flat';

export default createConfigForNuxt(
  {
    features: {
      tooling: {
        regexp: true,
        unicorn: true,
      },
      nuxt: {
        sortConfigKeys: true,
      },
      typescript: {
        strict: true,
        tsconfigPath: './tsconfig.eslint.json',
      },
    },
  },
  {
    name: 'project/strict-clean-code',
    rules: {
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always'],
      'import/max-dependencies': ['error', { max: 15, ignoreTypeImports: true }],
      'import/no-cycle': ['error', { ignoreExternal: true }],
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.{test,spec}.{js,jsx,ts,tsx}',
            '**/*.config.{js,cjs,mjs,ts}',
            'eslint.config.{js,cjs,mjs,ts}',
            'nuxt.config.{js,cjs,mjs,ts}',
            'app.config.{js,cjs,mjs,ts}',
            'scripts/**/*.{js,ts}',
          ],
          includeTypes: true,
          optionalDependencies: false,
          peerDependencies: false,
        },
      ],
      'import/no-relative-parent-imports': 'error',
      'no-eq-null': 'error',
      'no-empty': ['error', { allowEmptyCatch: false }],
      'no-else-return': 'error',
      'no-lonely-if': 'error',
      'no-nested-ternary': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'IfStatement[alternate]',
          message: 'Не используйте else/else if. Пишите guard clauses и ранние return.',
        },
      ],
      complexity: ['error', 10],
      'max-classes-per-file': ['error', 1],
      'max-depth': ['error', 2],
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': [
        'error',
        { max: 60, skipBlankLines: true, skipComments: true, IIFEs: true },
      ],
      'max-nested-callbacks': ['error', 2],
      'max-params': ['error', 3],
      'max-statements': ['error', 15],
      'unicorn/prevent-abbreviations': [
        'error',
        {
          checkProperties: false,
          checkDefaultAndNamespaceImports: true,
          allowList: {
            props: true,
            ref: true,
            refs: true,
          },
        },
      ],
    },
  },
  {
    name: 'project/strict-typescript',
    files: ['**/*.{ts,tsx,vue}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowAny: false,
          allowNullableBoolean: false,
          allowNullableNumber: false,
          allowNullableObject: false,
          allowNullableString: false,
          allowNumber: false,
          allowString: false,
        },
      ],
    },
  },
  {
    name: 'project/vue-clean-code',
    files: ['**/*.vue'],
    rules: {
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/component-name-in-template-casing': [
        'error',
        'PascalCase',
        {
          registeredComponentsOnly: false,
          ignores: [],
        },
      ],
      'vue/custom-event-name-casing': ['error', 'kebab-case'],
      'vue/attribute-hyphenation': ['error', 'always'],
      'vue/v-on-event-hyphenation': ['error', 'always'],
      'vue/no-mutating-props': 'error',
      'vue/no-side-effects-in-computed-properties': 'error',
      'vue/no-async-in-computed-properties': 'error',
      'vue/no-template-shadow': 'error',
      'vue/no-unused-components': 'error',
      'vue/no-unused-vars': 'error',
      'vue/no-use-v-if-with-v-for': 'error',
      'vue/no-useless-v-bind': 'error',
      'vue/no-v-html': 'error',
      'vue/one-component-per-file': 'error',
      'vue/require-explicit-emits': 'error',
      'vue/no-setup-props-reactivity-loss': 'error',
      'vue/max-template-depth': ['error', { maxDepth: 4 }],
      'vue/no-restricted-syntax': [
        'error',
        {
          selector: "VAttribute[directive=true][key.name.name='else']",
          message: 'Не используйте v-else. Предпочитайте явные условия и guard clauses.',
        },
        {
          selector: "VAttribute[directive=true][key.name.name='else-if']",
          message: 'Не используйте v-else-if. Предпочитайте явные условия и guard clauses.',
        },
      ],
    },
  },
  {
    name: 'project/nuxt-clean-code',
    files: ['nuxt.config.{js,ts,mjs,cjs}', 'app.config.{js,ts,mjs,cjs}'],
    rules: {
      'nuxt/no-nuxt-config-test-key': 'error',
      'nuxt/nuxt-config-keys-order': 'error',
      'nuxt/prefer-import-meta': 'error',
    },
  },
);
