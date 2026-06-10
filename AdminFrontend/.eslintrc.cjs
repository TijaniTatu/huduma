module.exports = {
  root: true,
  ignorePatterns: ['dist', 'build', 'node_modules', '*.config.js'],
  env: { browser: true, es2021: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: 'detect' } },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'react/prop-types': 'off',
    // Legacy code carried over from CRA has many unused imports/vars; surface
    // them as warnings rather than failing the build.
    'no-unused-vars': 'warn',
  },
}
