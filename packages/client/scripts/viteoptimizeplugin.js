/**
 * Adapted from
 * https://github.com/antfu/vite-plugin-optimize-persist
 */


import fs from 'fs-extra'
import _debug from 'debug'
import path from 'path'

const debug = _debug('vite-plugin-optimize-persist')

function VitePluginPackageConfig(options = {}) {
  const delay = options.delay || 1000

  return {
    name: 'hi',
    apply: 'serve',
    configureServer(server) {
      const pkgConfig = server.config.plugins.find((i) => i.name === 'vite-plugin-package-config')?.api.options
      const alias = server.config.resolve.alias

      if (!pkgConfig)
        throw new Error('[vite-config-optimize-persist] plugin "vite-plugin-package-config" not found, have you installed it ?')

      // @ts-expect-error
      let optimizeDepsMetadata = server._ssrExternals
      const forceIncluded = server.config?.optimizeDeps?.include || []
      let newDeps = []
      let timer

      function update() {
        newDeps = Object.keys(
          optimizeDepsMetadata?.optimized || {},
        ).filter(i => !forceIncluded.includes(i))
        debug('newDeps', newDeps)

        clearTimeout(timer)
        timer = setTimeout(write, delay)
      }

      async function write() {
        if (!newDeps.length)
          return
        newDeps = newDeps.map(dep => {
          const aliasedDep = alias.find((a) => a.replacement === dep)
          if(typeof aliasedDep !== 'undefined') {
            return aliasedDep.find
          }
          return dep
        })
        const jsonPath = path.resolve(__dirname, `../optimizeDeps.json`)
        debug(`writing to optimizeDeps.json`)
        const pkg = await fs.readJSON(jsonPath)
        pkg.dependencies = pkg.dependencies || {}
        pkg.dependencies = Array.from(new Set([
          ...(pkg.dependencies || []),
          ...newDeps,
        ]))
        pkg.dependencies.sort()
        server.watcher.unwatch(jsonPath)
        await fs.writeJSON(jsonPath, pkg, { spaces: 2 })
        server.watcher.add(jsonPath)
        debug('written')
      }

      Object.defineProperty(server, '_optimizeDepsMetadata', {
        get() {
          return optimizeDepsMetadata
        },
        set(v) {
          optimizeDepsMetadata = v
          update()
        },
      })
    },
  }
}

export default VitePluginPackageConfig