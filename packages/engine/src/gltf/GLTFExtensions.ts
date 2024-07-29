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

import { getState } from '@etherealengine/hyperflux'
import { GLTF } from '@gltf-transform/core'
import {
  BufferGeometry,
  Color,
  LinearSRGBColorSpace,
  MeshBasicMaterial,
  NormalBufferAttributes,
  SRGBColorSpace
} from 'three'
import { ATTRIBUTES, WEBGL_COMPONENT_TYPES } from '../assets/loaders/gltf/GLTFConstants'
import { EXTENSIONS } from '../assets/loaders/gltf/GLTFExtensions'
import { GLTFParserOptions } from '../assets/loaders/gltf/GLTFParser'
import { AssetLoaderState } from '../assets/state/AssetLoaderState'
import { GLTFLoaderFunctions } from './GLTFLoaderFunctions'

const KHR_DRACO_MESH_COMPRESSION = {
  decodePrimitive(options: GLTFParserOptions, json: GLTF.IGLTF, primitive: GLTF.IMeshPrimitive) {
    const dracoLoader = getState(AssetLoaderState).gltfLoader.dracoLoader!
    const dracoMeshCompressionExtension = primitive.extensions![EXTENSIONS.KHR_DRACO_MESH_COMPRESSION] as any
    const bufferViewIndex = dracoMeshCompressionExtension.bufferView
    const gltfAttributeMap = dracoMeshCompressionExtension.attributes
    const threeAttributeMap = {} as { [key: string]: string }
    const attributeNormalizedMap = {} as { [key: string]: boolean }
    const attributeTypeMap = {} as { [key: string]: string }

    for (const attributeName in gltfAttributeMap) {
      const threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase()

      threeAttributeMap[threeAttributeName] = gltfAttributeMap[attributeName]
    }

    for (const attributeName in primitive.attributes) {
      const threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase()

      if (gltfAttributeMap[attributeName] !== undefined) {
        // @ts-ignore -- TODO type extensions
        const accessorDef = json.accessors[primitive.attributes[attributeName]]
        const componentType = WEBGL_COMPONENT_TYPES[accessorDef.componentType]

        attributeTypeMap[threeAttributeName] = componentType.name
        attributeNormalizedMap[threeAttributeName] = accessorDef.normalized === true
      }
    }

    return GLTFLoaderFunctions.loadBufferView(options, json, bufferViewIndex).then(function (bufferView) {
      return new Promise<BufferGeometry<NormalBufferAttributes>>(function (resolve) {
        dracoLoader.preload().decodeDracoFile(
          bufferView,
          function (geometry) {
            for (const attributeName in geometry.attributes) {
              const attribute = geometry.attributes[attributeName]
              const normalized = attributeNormalizedMap[attributeName]

              if (normalized !== undefined) attribute.normalized = normalized
            }

            resolve(geometry)
          },
          threeAttributeMap,
          attributeTypeMap
        )
      })
    })
  }
}

const KHR_MATERIALS_UNLIT = {
  getMaterialType() {
    return MeshBasicMaterial
  },

  extendParams(options: GLTFParserOptions, json: GLTF.IGLTF, materialParams, materialDef) {
    const pending = [] as Promise<any>[]

    materialParams.color = new Color(1.0, 1.0, 1.0)
    materialParams.opacity = 1.0

    const metallicRoughness = materialDef.pbrMetallicRoughness

    if (metallicRoughness) {
      if (Array.isArray(metallicRoughness.baseColorFactor)) {
        const array = metallicRoughness.baseColorFactor

        materialParams.color.setRGB(array[0], array[1], array[2], LinearSRGBColorSpace)
        materialParams.opacity = array[3]
      }

      if (metallicRoughness.baseColorTexture !== undefined) {
        pending.push(
          GLTFLoaderFunctions.assignTexture(
            options,
            json,
            materialParams,
            'map',
            metallicRoughness.baseColorTexture,
            SRGBColorSpace
          )
        )
      }
    }

    return Promise.all(pending)
  }
}

export const GLTFExtensions = {
  [EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]: KHR_DRACO_MESH_COMPRESSION,
  [EXTENSIONS.KHR_MATERIALS_UNLIT]: KHR_MATERIALS_UNLIT
}
