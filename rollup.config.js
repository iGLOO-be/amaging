
import json from 'rollup-plugin-json'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-re'
import ignore from 'rollup-plugin-ignore'

export default {
  input: './src/amaging/server.js',
  output: {
    file: './lib/amaging/server.js',
    format: 'cjs'
  },
  plugins: [
    replace({
      // ... do replace before commonjs
      patterns: [
        {
          // regexp match with resolved path
          match: /formidable(\/|\\)lib/,
          // string or regexp
          test: 'if (global.GENTLY) require = GENTLY.hijack(require);',
          // string or function to replaced with
          replace: ''
        }
      ]
    }),
    json(),
    babel({
      exclude: 'node_modules/**'
    }),
    resolve({
      only: [/^(?!aws-sdk).*$/],
      preferBuiltins: true
    }),
    commonjs(),
    ignore(['spawn-sync'])
  ]
}
