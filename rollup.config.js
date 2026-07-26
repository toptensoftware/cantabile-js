import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import virtual from '@rollup/plugin-virtual';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import nodePolyfills from 'rollup-plugin-polyfill-node';

export default {
  input: 'src/browser.js',
  output: [
    {
      file: 'dist/cantabile.js',
      format: 'iife',
      sourcemap: true,
      name: 'Cantabile',
      exports: 'default'
    },
    {
      file: 'dist/cantabile.min.js',
      format: 'iife',
      sourcemap: true,
      name: 'Cantabile',
      exports: 'default',
      plugins: [terser()],
    },
  ],
  plugins: [
    nodePolyfills(),
    virtual({
      'isomorphic-ws': 'export default globalThis.WebSocket;',  // Browser WebSocket
    }),    
    replace({
      'process.browser': 'true', // Replace process.browser with true so the browser host detection works
      preventAssignment: true,
    }),

    // Resolve node_modules using their browser entry points where available
    resolve({ browser: true, preferBuiltins: false }),
    
    commonjs()
  ],
};
