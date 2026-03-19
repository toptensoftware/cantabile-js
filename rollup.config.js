import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import virtual from '@rollup/plugin-virtual';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';

export default {
  input: 'CantabileAPI.js',
  output: [
    {
      file: 'dist/cantabile.js',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: 'dist/cantabile.min.js',
      format: 'esm',
      sourcemap: true,
      plugins: [terser()],
    },
  ],
  plugins: [
    // Browser shims for Node.js-specific imports
    virtual({
      'isomorphic-ws': 'export default globalThis.WebSocket;',
      'node-fetch': 'export default globalThis.fetch;',
      // Redirect Node's `events` to the already-bundled eventemitter3
      'events': `import EventEmitter from 'eventemitter3'; export default EventEmitter; export { EventEmitter };`,
    }),

    // Replace process.browser with true so the browser host detection works
    replace({
      'process.browser': 'true',
      preventAssignment: true,
    }),

    // Resolve node_modules using their browser entry points where available
    resolve({ browser: true, preferBuiltins: false }),

    // Convert any CommonJS dependencies (debug, eventemitter3) to ESM
    commonjs(),
  ],
};
