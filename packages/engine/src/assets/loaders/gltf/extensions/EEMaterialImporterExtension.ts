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

import { Color, Material } from 'three'

import { getState } from '@etherealengine/hyperflux'

import {
  materialIdToDefaultArgs,
  protoIdToFactory,
  prototypeFromId,
  PrototypeNotFoundError
} from '../../../../renderer/materials/functions/MaterialLibraryFunctions'
import { MaterialLibraryState } from '../../../../renderer/materials/MaterialLibrary'
import { EEMaterialExtensionType } from '../../../exporters/gltf/extensions/EEMaterialExporterExtension'
import { GLTFLoaderPlugin } from '../GLTFLoader'
import { ImporterExtension } from './ImporterExtension'

export class EEMaterialImporterExtension extends ImporterExtension implements GLTFLoaderPlugin {
  name = 'EE_material'

  getMaterialType(materialIndex: number) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]
    if (!materialDef.extensions?.[this.name]) return null
    const eeMaterial: EEMaterialExtensionType = materialDef.extensions[this.name]
    let factory: ((parms: any) => Material) | null = null
    try {
      factory = protoIdToFactory(eeMaterial.prototype)
    } catch (e) {
      if (e instanceof PrototypeNotFoundError) {
        console.warn('prototype ' + eeMaterial.prototype + ' not found')
      } else {
        throw e
      }
    }
    return factory
      ? (function (args) {
          const material = factory!(args)
          typeof eeMaterial.uuid === 'string' && (material.uuid = eeMaterial.uuid)
          return material
        } as unknown as typeof Material)
      : null
  }

  extendMaterialParams(materialIndex: number, materialParams: { [_: string]: any }) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]
    if (!materialDef.extensions?.[this.name]) return Promise.resolve()
    const extension: EEMaterialExtensionType = materialDef.extensions[this.name]
    if (extension.plugins) {
      if (!materialDef.extras) materialDef.extras = {}
      materialDef.extras['plugins'] = extension.plugins
    }
    const materialLibrary = getState(MaterialLibraryState)
    const materialComponent = materialLibrary.materials[extension.uuid]
    let defaultArgs: { [_: string]: any } = {}
    let foundPrototype = false
    if (materialComponent) {
      foundPrototype = !!materialLibrary.prototypes[materialComponent.prototype]
      defaultArgs = materialIdToDefaultArgs(extension.uuid)!
    } else {
      try {
        defaultArgs = prototypeFromId(extension.prototype).arguments
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
    const parseTarget = foundPrototype ? materialParams : materialDef.extras.args
    return Promise.all(
      Object.entries(extension.args).map(async ([k, v]) => {
        switch (v.type) {
          case undefined:
            break
          case 'texture':
            if (v.contents) {
              await parser.assignTexture(parseTarget, k, v.contents)
            } else {
              parseTarget[k] = null
            }
            break
          case 'color':
            if (v.contents !== null && !(v.contents as Color).isColor) {
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
