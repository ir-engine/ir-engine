import {localModule, polygenConfig} from '@callstack/polygen-config';

/**
 * @type {import('@callstack/polygen/config').PolygenConfig}
 */
export default polygenConfig({
  /**
   * Output configuration
   */
  output: {
    /**
     * Directory where the output files will be stored.
     */
    directory: 'wasm/_generated',
  },

  /**
   * Configuration for the `scan` command.
   */
  scan: {
    /**
     * List of paths to scan for modules.
     *
     * Each item is a glob pattern that can use wildcards, or be used
     * to ignore specific element by prefixing it by `!`.
     */
    paths: ['src/**/*.wasm'],
  },

  /**
   * List of modules to be used in the project.
   *
   * Each module can be individually configured, by passing options object as a second
   * argument (or 3rd, for external modules).
   */
  modules: [
    localModule('src/meshopt_decoder.wasm'),
    localModule('src/rapier_wasm3d_bg.wasm'),
  ],
});
