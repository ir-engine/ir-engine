/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { CubeTexture, Material, Texture } from 'three'
import matches from 'ts-matches'

import { EntityUUID, getComponent, hasComponent, UUIDComponent } from '@ir-engine/ecs'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import {
  MaterialPlugins,
  MaterialPrototypeComponent,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'

import { injectMaterialDefaults } from '@ir-engine/spatial/src/renderer/materials/materialFunctions'
import { GLTFWriter } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

export type OldEEMaterialExtensionType = {
  uuid: string
  name: string
  prototype: string
  args: {
    [field: string]: any
  }
}

export function isOldEEMaterial(extension: any) {
  const argValues = Object.values(extension.args)
  return !matches
    .arrayOf(
      matches.shape({
        type: matches.string
      })
    )
    .test(argValues)
}

export type MaterialExtensionPluginType = { id: string; uniforms: { [key: string]: any } }

export type EEMaterialExtensionType = {
  uuid: EntityUUID
  name: string
  prototype: string
  args: {
    [field: string]: {
      type: string
      contents: any
    }
  }
  plugins: MaterialExtensionPluginType[]
}

export default class EEMaterialExporterExtension extends ExporterExtension {
  constructor(writer: GLTFWriter) {
    super(writer)
    this.name = 'EE_material'
    this.matCache = new Map()
  }

  matCache: Map<any, any>

  writeMaterial(material: Material, materialDef) {
    const materialEntityUUID = material.uuid as EntityUUID
    const materialEntity = UUIDComponent.getEntityByUUID(materialEntityUUID)
    const argData = injectMaterialDefaults(materialEntityUUID)
    if (!argData) return
    const result: any = {}
    Object.entries(argData).map(([k, v]) => {
      const argEntry = {
        type: v.type,
        contents: material[k]
      }
      if (v.type === 'texture' && material[k]) {
        if (k === 'envMap') return //for skipping environment maps which cause errors
        if ((material[k] as CubeTexture).isCubeTexture) return //for skipping environment maps which cause errors
        const texture = material[k] as Texture
        if (texture.source.data && this.matCache.has(texture.source.data)) {
          argEntry.contents = this.matCache.get(texture.source.data)
        } else {
          const mapDef = {
            index: this.writer.processTexture(texture)
          }
          this.matCache.set(texture.source.data, { ...mapDef })
          argEntry.contents = mapDef
        }
        argEntry.contents.texCoord = texture.channel
        this.writer.options.flipY && (texture.repeat.y *= -1)
        this.writer.applyTextureTransform(argEntry.contents, texture)
      }
      result[k] = argEntry
    })
    delete materialDef.pbrMetallicRoughness
    delete materialDef.normalTexture
    delete materialDef.emissiveTexture
    delete materialDef.emissiveFactor
    const materialComponent = getComponent(materialEntity, MaterialStateComponent)
    const prototype = getComponent(materialComponent.prototypeEntity!, MaterialPrototypeComponent)
    const plugins = Object.keys(MaterialPlugins)
      .map((plugin) => {
        if (!hasComponent(materialEntity, MaterialPlugins[plugin])) return
        const pluginComponent = getComponent(materialEntity, MaterialPlugins[plugin])
        const uniforms = {}
        for (const key in pluginComponent) {
          uniforms[key] = pluginComponent[key].value
        }
        return { id: plugin, uniforms }
      })
      .filter(Boolean)
    materialDef.extensions = materialDef.extensions ?? {}
    materialDef.extensions[this.name] = {
      uuid: getComponent(materialEntity, UUIDComponent),
      name: getComponent(materialEntity, NameComponent),
      prototype: Object.keys(prototype.prototypeConstructor!)[0],
      plugins: plugins,
      args: result
    }
    materialDef.name = getComponent(materialEntity, NameComponent)
    this.writer.extensionsUsed[this.name] = true
  }
}
