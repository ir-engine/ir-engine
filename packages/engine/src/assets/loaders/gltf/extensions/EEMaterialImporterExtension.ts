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

import { Color, Material, SRGBColorSpace } from 'three'
import matches from 'ts-matches'

import { getComponent, getOptionalComponent, UUIDComponent } from '@ir-engine/ecs'
import {
  MaterialPrototypeComponent,
  MaterialPrototypeObjectConstructor,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'

import {
  getPrototypeEntityFromName,
  injectMaterialDefaults,
  PrototypeNotFoundError
} from '@ir-engine/spatial/src/renderer/materials/materialFunctions'
import {
  EEMaterialExtensionType,
  isOldEEMaterial,
  OldEEMaterialExtensionType
} from '../../../exporters/gltf/extensions/EEMaterialExporterExtension'
import { GLTFLoaderPlugin } from '../GLTFLoader'
import { ImporterExtension } from './ImporterExtension'

export class EEMaterialImporterExtension extends ImporterExtension implements GLTFLoaderPlugin {
  name = 'EE_material'

  getMaterialType(materialIndex: number) {
    const parser = this.parser
    const materialDef = parser.json.materials![materialIndex]
    if (!materialDef.extensions?.[this.name]) return null
    const eeMaterial: EEMaterialExtensionType = materialDef.extensions[this.name] as any
    let constructor: MaterialPrototypeObjectConstructor | null = null
    try {
      constructor = getComponent(
        getPrototypeEntityFromName(eeMaterial.prototype)!,
        MaterialPrototypeComponent
      ).prototypeConstructor
    } catch (e) {
      if (e instanceof PrototypeNotFoundError) {
        console.warn('prototype ' + eeMaterial.prototype + ' not found')
      } else {
        throw e
      }
    }
    return constructor
      ? (function (args) {
          const material = new constructor![eeMaterial.prototype](args)
          typeof eeMaterial.uuid === 'string' && (material.uuid = eeMaterial.uuid)
          return material
        } as unknown as typeof Material)
      : null
  }

  extendMaterialParams(materialIndex: number, materialParams: { [_: string]: any }) {
    const parser = this.parser
    const materialDef = parser.json.materials![materialIndex]
    if (!materialDef.extensions?.[this.name]) return Promise.resolve()
    const extension: EEMaterialExtensionType = materialDef.extensions[this.name] as any
    if (extension.plugins) {
      if (!materialDef.extras) materialDef.extras = {}
      materialDef.extras['plugins'] = extension.plugins
      for (const plugin of extension.plugins) {
        if (!plugin?.uniforms) continue
        for (const v of Object.values(plugin.uniforms)) {
          if (v.type === 'texture') {
            parser.assignTexture(materialParams, v.name, v.contents)
          }
        }
      }
    }
    const materialComponent = getOptionalComponent(
      UUIDComponent.getEntityByUUID(extension.uuid),
      MaterialStateComponent
    )
    let foundPrototype = false
    if (materialComponent) {
      foundPrototype = !!materialComponent.prototypeEntity
      injectMaterialDefaults(extension.uuid)
    } else {
      try {
        getComponent(getPrototypeEntityFromName(extension.prototype)!, MaterialPrototypeComponent).prototypeArguments
        foundPrototype = true
      } catch (e) {
        if (e instanceof PrototypeNotFoundError) {
          console.warn('prototype ' + extension.prototype + ' not found')
        } else {
          throw e
        }
      }
    }
    if (!foundPrototype) {
      materialDef.extras = materialDef.extras || {}
      materialDef.extras['args'] = extension.args
    }
    //if we found a prototype, we populate the materialParams as normal.
    //if we didn't find a prototype, we populate the materialDef.extras.args to hold for later.
    const parseTarget = foundPrototype ? materialParams : (materialDef.extras!.args as any)
    if (isOldEEMaterial(extension)) {
      const oldExtension: OldEEMaterialExtensionType = extension
      return Promise.all(
        Object.entries(oldExtension.args).map(async ([k, v]) => {
          //check if the value is a texture
          if (matches.shape({ index: matches.number }).test(v)) {
            if (k === 'map') {
              await parser.assignTexture(parseTarget, k, v, SRGBColorSpace)
            } else {
              await parser.assignTexture(parseTarget, k, v)
            }
          }
          //check if the value is a color by checking key
          else if ((k.toLowerCase().includes('color') || k === 'emissive') && typeof v === 'number') {
            parseTarget[k] = new Color(v)
          }
          //otherwise, just assign the value
          else {
            parseTarget[k] = v
          }
        })
      )
    }
    return Promise.all(
      Object.entries(extension.args).map(async ([k, v]) => {
        switch (v.type) {
          case undefined:
            break
          case 'texture':
            if (v.contents) {
              if (k === 'map') {
                await parser.assignTexture(parseTarget, k, v.contents, SRGBColorSpace)
              } else {
                await parser.assignTexture(parseTarget, k, v.contents)
              }
            } else {
              parseTarget[k] = null
            }
            break
          case 'color':
            if (v.contents !== null && !(v.contents as Color)?.isColor) {
              parseTarget[k] = new Color(v.contents)
            } else {
              parseTarget[k] = v.contents
            }
            break
          default:
            parseTarget[k] = v.contents
            break
        }
      })
    )
  }
}
