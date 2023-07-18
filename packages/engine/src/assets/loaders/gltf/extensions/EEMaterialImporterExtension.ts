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

import { Color, Material, Mesh, Texture } from 'three'

import { getState } from '@etherealengine/hyperflux'

import {
  materialIdToDefaultArgs,
  materialIdToFactory,
  protoIdToFactory,
  prototypeFromId
} from '../../../../renderer/materials/functions/MaterialLibraryFunctions'
import { applyMaterialPlugin } from '../../../../renderer/materials/functions/MaterialPluginFunctions'
import { MaterialLibraryState } from '../../../../renderer/materials/MaterialLibrary'
import iterateObject3D from '../../../../scene/util/iterateObject3D'
import { EEMaterialExtensionType } from '../../../exporters/gltf/extensions/EEMaterialExporterExtension'
import { GLTF, GLTFLoaderPlugin, GLTFParser } from '../GLTFLoader'
import { ImporterExtension } from './ImporterExtension'

export class EEMaterialImporterExtension extends ImporterExtension implements GLTFLoaderPlugin {
  name = 'EE_material'

  getMaterialType(materialIndex: number) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]
    if (!materialDef.extensions?.[this.name]) return null
    const eeMaterial: EEMaterialExtensionType = materialDef.extensions[this.name]
    const factory = protoIdToFactory(eeMaterial.prototype)
    return factory
      ? (function (args) {
          const material = factory(args)
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
    const defaultArgs = getState(MaterialLibraryState).materials[extension.uuid]
      ? materialIdToDefaultArgs(extension.uuid)!
      : prototypeFromId(extension.prototype).arguments
    return Promise.all(
      Object.entries(extension.args).map(async ([k, v]) => {
        switch (defaultArgs[k]?.type) {
          case undefined:
            break
          case 'texture':
            if (v) {
              await parser.assignTexture(materialParams, k, v)
            }
            break
          case 'color':
            if (v && !(v as Color).isColor) {
              materialParams[k] = new Color(v)
            } else {
              materialParams[k] = v
            }
            break
          default:
            materialParams[k] = v
            break
        }
      })
    )
  }
}
