/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
  Shader,
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

export function addOBCPlugin(material: Material, plugin: PluginType): void {
  material.onBeforeCompile = plugin as any
  material.needsUpdate = true
}

export function removeOBCPlugin(material: Material, plugin: PluginType): void {
  if (material.plugins) {
    const index = indexOfPlugin(plugin, material.plugins)
    if (index > -1) material.plugins.splice(index, 1)
    material.plugins?.sort(sortPluginsByPriority)
  }
}

export function hasOBCPlugin(material: Material, plugin: PluginType): boolean {
  if (!material.plugins) return false
  return indexOfPlugin(plugin, material.plugins) > -1
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
  get: function (this: Material) {
    if (!this._onBeforeCompile.toString) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
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
  set: function (this: Material, plugins: PluginType | PluginType[]) {
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

      const key = Math.random()
      this.customProgramCacheKey = () => key.toString()
      // this.customProgramCacheKey = () => {
      //   if (typeof this._onBeforeCompile.toString === 'function')
      //     return this._onBeforeCompile.toString()
      //   else
      //     return this.onBeforeCompile.toString()
      // }
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

    Material.prototype._onBeforeCompile = function (shader, renderer) {
      if (!this.shader) this.shader = shader
      if (!this.plugins) return

      for (let i = 0, l = this.plugins.length; i < l; i++) {
        const plugin = this.plugins[i]
        ;(plugin instanceof Function ? plugin : plugin.compile).call(this, shader, renderer)
      }
    }
    Material.prototype._onBeforeCompile.toString = null!

    const dispose = Material.prototype.dispose

    Material.prototype.dispose = function () {
      this.onBeforeCompile = null
      dispose.call(this)
    }

    Object.defineProperty(Material.prototype, 'onBeforeCompile', onBeforeCompile)
  }
}

declare module 'three/src/materials/Material' {
  export interface Material {
    shader: Shader
    plugins?: PluginType[]
    _onBeforeCompile: typeof Material.prototype.onBeforeCompile
    needsUpdate: boolean
  }
}
