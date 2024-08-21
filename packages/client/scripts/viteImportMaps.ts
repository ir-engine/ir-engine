/**
 * https://github.com/vitejs/vite/issues/2483#issuecomment-1912618966
 */

import appRootPath from 'app-root-path'
import path from 'path'
import type { Plugin, UserConfig } from 'vite'

/**
 * Defines the document's import maps.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap}
 * @see {@link https://github.com/vitejs/vite/issues/2483}
 */
export default (command: 'build' | 'serve', entries: { [key: string]: string }): Plugin => ({
  name: 'importMap',
  config: () => {
    const config: UserConfig = {
      optimizeDeps: {
        // entries: Object.values(entries),
        /**
         * Specify the entry points for pre-optimization.
         */
        // include: Object.values(entries),
        exclude: [...Object.keys(entries), ...Object.values(entries)],
      },
      build: {
        rollupOptions: {
          // external: Object.keys(entries),
          /**
           * Specify the entry points for the import map. Points to the original files.
           */
          input: Object.fromEntries(
            Object.entries(entries).concat([['main', path.resolve(appRootPath.path, 'packages/client/index.html')]])
          ),
          /**
           * Specify the output files for the import map. Points to the bundled files.
           */
          output: {
            entryFileNames: 'entry/[name].js'
          }
        }
      }
    }

    return config
  },
  transformIndexHtml: (html) => {
    /**
     * When in development mode, the import map should point to the original files.
     * When in production mode, it should point to the bundled files.
     */
    const content = Object.entries(entries)
      .map(([from, to]) => (command === 'build' ? `"${from}":"/entry/${from}.js"` : `"${from}":"${to}"`))
      .join(',')
    return html.replace(/^(\s*?)<title>.*?<\/title>/m, `$&$1<script type="importmap">{"imports":{${content}}}</script>`)
  },
  transform(code, id, options) {
    for (const [from, to] of Object.entries(entries)) {
      if (id.endsWith(from + '/xrengine.config.ts')) {
        console.log('\n\ntransform:', code, id, options, '\n\n')
        return code
      }
    }
  },
  // load(id) {
  //   for (const [from, to] of Object.entries(entries)) {
  //     if (id.endsWith(from + '/xrengine.config.ts')) {
  //       console.log('load:', id)
  //       return {
  //         code: `export * from '@${from}/xrengine.config.ts';`,
  //         map: null
  //       }
  //     }
  //   }
  // }
})
