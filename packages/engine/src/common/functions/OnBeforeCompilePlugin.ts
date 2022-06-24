import {
  LineBasicMaterial,
  LineDashedMaterial,
  Material,
  MeshBasicMaterial,
  MeshDepthMaterial,
  MeshDistanceMaterial,
  MeshLambertMaterial,
  MeshMatcapMaterial,
  MeshNormalMaterial,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MeshToonMaterial,
  PointsMaterial,
  RawShaderMaterial,
  ShaderMaterial,
  ShadowMaterial,
  SpriteMaterial
} from 'three'

// Converted to typescript from Fyrestar https://mevedia.com (https://github.com/Fyrestar/OnBeforeCompilePlugin)
// Only implemented the OnBeforeCompile part because OnBeforeRender is not working well with the postprocessing.

export type PluginObjectType = {
  id: string
  priority?: number
  compile: typeof Material.prototype.onBeforeCompile
}

export type PluginType = PluginObjectType | typeof Material.prototype.onBeforeCompile

export type CustomMaterial = Material & {
  plugins?: PluginType[]
  _onBeforeCompile: typeof Material.prototype.onBeforeCompile
  onBeforeCompile: PluginType
  needsUpdate: boolean
}

export function addOBCPlugin(material: Material, plugin: PluginType): void {
  material.onBeforeCompile = plugin as any
}

export function removeOBCPlugin(material: Material, plugin: PluginType): void {
  const mat = material as any as CustomMaterial
  if (mat.plugins) {
    const index = indexOfPlugin(plugin, mat.plugins)
    if (index > -1) mat.plugins.splice(index, 1)
    mat.plugins?.sort(sortPluginsByPriority)
  }
}

export function hasOBCPlugin(material: Material, plugin: PluginType): boolean {
  const mat = material as any as CustomMaterial
  if (!mat.plugins) return false
  return indexOfPlugin(plugin, mat.plugins) > -1
}

function indexOfPlugin(plugin: PluginType, arr: PluginType[]): number {
  if (typeof plugin === 'function') {
    for (let i = 0; i < arr.length; i++) {
      if (typeof arr[i] === 'function' && arr[i] === plugin) return i
    }
  } else {
    for (let i = 0; i < arr.length; i++) {
      if (typeof arr[i] === 'function') continue
      else if ((arr[i] as PluginObjectType).id === plugin.id) return i
    }
  }

  return -1
}

function sortPluginsByPriority(a: PluginType, b: PluginType): number {
  return (b as PluginObjectType).priority! - (a as PluginObjectType).priority!
}

const onBeforeCompile = {
  get: function (this: CustomMaterial) {
    if (!this._onBeforeCompile.toString) {
      const self = this

      this._onBeforeCompile.toString = function () {
        let code = ''

        if (self.plugins) {
          for (let i = 0, l = self.plugins.length; i < l; i++) {
            const plugin = self.plugins[i]
            code += plugin instanceof Function ? plugin.toString() : plugin.compile.toString()
          }
        }

        return code
      }
    }

    return this._onBeforeCompile
  },
  set: function (this: CustomMaterial, plugins: PluginType | PluginType[]) {
    if (plugins === null) {
      if (this.plugins) {
        while (this.plugins.length) removeOBCPlugin(this, this.plugins[0])
      }
    } else if (plugins instanceof Array) {
      for (let i = 0, l = plugins.length; i < l; i++) (this as any).onBeforeCompile = plugins[i]
    } else if (plugins instanceof Function || plugins instanceof Object) {
      const plugin = plugins

      if (hasOBCPlugin(this, plugin)) return
      if (!this.plugins) this.plugins = []
      ;(plugin as PluginObjectType).priority =
        typeof (plugin as PluginObjectType).priority === 'undefined' ? 1 : (plugin as PluginObjectType).priority

      this.plugins.unshift(plugin)
      this.plugins.sort(sortPluginsByPriority)

      // Invalidate the cache for the shader cache
      const key = Math.random()
      this.customProgramCacheKey = () => key.toString()
    } else {
      console.error('Invalid type "%s" assigned to onBeforeCompile', typeof plugins)
    }
  }
}

export function overrideOnBeforeCompile() {
  const Materials = [
    ShadowMaterial,
    SpriteMaterial,
    RawShaderMaterial,
    ShaderMaterial,
    PointsMaterial,
    MeshPhysicalMaterial,
    MeshStandardMaterial,
    MeshPhongMaterial,
    MeshToonMaterial,
    MeshNormalMaterial,
    MeshLambertMaterial,
    MeshDepthMaterial,
    MeshDistanceMaterial,
    MeshBasicMaterial,
    MeshMatcapMaterial,
    LineDashedMaterial,
    LineBasicMaterial,
    Material
  ]

  for (let i = 0, l = Materials.length; i < l; i++) {
    const Material = Materials[i]

    ;(Material.prototype as any)._onBeforeCompile = function (shader, renderer) {
      if (!this.plugins) return

      for (let i = 0, l = this.plugins.length; i < l; i++) {
        const plugin = this.plugins[i]
        ;(plugin instanceof Function ? plugin : plugin.compile).call(this, shader, renderer)
      }
    }
    ;(Material.prototype as any)._onBeforeCompile.toString = null!

    const dispose = Material.prototype.dispose

    Material.prototype.dispose = function () {
      this.onBeforeCompile = null
      dispose.call(this)
    }

    Object.defineProperty(Material.prototype, 'onBeforeCompile', onBeforeCompile)
  }
}
