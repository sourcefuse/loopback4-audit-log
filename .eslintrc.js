module.exports = {
  extends: '@loopback/eslint-config',
  rules: {
    'no-extra-boolean-cast': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    'no-prototype-builtins': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
    'checksVoidReturn': false,
  },
};
