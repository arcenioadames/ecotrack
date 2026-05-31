/* ESLint config mínimos para EcoTrack mobile.
   Objetivo: que `npm run lint` pueda parsear TS/TSX en React Native/Expo.
*/

module.exports = {
  root: true,
  ignorePatterns: ['node_modules/', 'dist/', '.expo/', 'android/', 'ios/'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    // Asegura compatibilidad con TS/TSX sin bloquear con rules agresivas.
    requireConfigFile: false,
  },
  plugins: ['@typescript-eslint'],
  env: {
    es6: true,
    node: true,
  },
  rules: {
    // Mantener el lint en modo estable (cero errores).
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*.ts', '**/__tests__/**/*.tsx'],
      rules: {
        // En tests, mocks suelen crear props/params no utilizados.
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      },
    },
  ],
};



