/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],
  ignoreFiles: ['node_modules/**', 'dist/**', 'coverage/**'],
  rules: {
    'color-hex-length': null,
    'alpha-value-notation': null,
    'color-function-notation': null,
    'color-function-alias-notation': null,
    'value-keyword-case': null,
    'media-feature-range-notation': null,
    'shorthand-property-no-redundant-values': null,
    'no-descending-specificity': null,
    'value-no-vendor-prefix': null,
  },
};
