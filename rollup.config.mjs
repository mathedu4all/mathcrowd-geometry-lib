/* eslint-disable camelcase */
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { babel } from '@rollup/plugin-babel'
import dts from 'rollup-plugin-dts'
import terser from '@rollup/plugin-terser'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import typescript from '@rollup/plugin-typescript'

const defaultNodeResolveConfig = { extensions: ['.js', '.jsx', '.ts', '.tsx'] }

const commonPlugins = [
  peerDepsExternal(),
  nodeResolve(defaultNodeResolveConfig),
  babel({
    presets: [['@babel/preset-env', { targets: '> 2%, not dead' }]],
    babelHelpers: 'runtime',
    plugins: ['@babel/plugin-transform-runtime'],
    exclude: ['node_modules/**']
  }),
  typescript(),
  commonjs(),
  terser({
    compress: {
      drop_console: true,
      drop_debugger: true
    },
    mangle: true,
    output: {
      comments: false
    }
  })
]

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true,
      inlineDynamicImports: true,
      exports: 'named'
    },
    plugins: commonPlugins,
    context: 'window'
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
      inlineDynamicImports: true,
      exports: 'named'
    },
    plugins: commonPlugins,
    context: 'window'
  },
  {
    input: 'dist/types/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
      sourcemap: true,
      inlineDynamicImports: true,
      exports: 'named'
    },
    external: [/\.css$/u],
    plugins: [dts()]
  }
]
