module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'typescript', 'prettier'],
  parserOptions: {
    parser: 'typescript-eslint-parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['typescript'],
  rules: {},
}
