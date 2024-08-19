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

import { GLTF } from '@gltf-transform/core'
import { getState, startReactor } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { BufferGeometry, NormalBufferAttributes } from 'three'
import { ATTRIBUTES, WEBGL_COMPONENT_TYPES } from '../assets/loaders/gltf/GLTFConstants'
import { EXTENSIONS } from '../assets/loaders/gltf/GLTFExtensions'
import { GLTFParserOptions } from '../assets/loaders/gltf/GLTFParser'
import { AssetLoaderState } from '../assets/state/AssetLoaderState'
import { GLTFLoaderFunctions } from './GLTFLoaderFunctions'

export const KHR_DRACO_MESH_COMPRESSION = {
  decodePrimitive(options: GLTFParserOptions, primitive: GLTF.IMeshPrimitive) {
    const json = options.document
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
        const accessorDef = json.accessors![primitive.attributes[attributeName]]
        const componentType = WEBGL_COMPONENT_TYPES[accessorDef.componentType]

        attributeTypeMap[threeAttributeName] = componentType.name
        attributeNormalizedMap[threeAttributeName] = accessorDef.normalized === true
      }
    }

    return new Promise<BufferGeometry<NormalBufferAttributes>>(function (resolve) {
      /**
       * Using an inline reactor here allows us to use reference counting & resource caching,
       * and release the uncompressed buffer as soon as it is no longer required
       */
      const reactor = startReactor(() => {
        const bufferView = GLTFLoaderFunctions.useLoadBufferView(options, bufferViewIndex)
        useEffect(() => {
          if (!bufferView) return
          const dracoLoader = getState(AssetLoaderState).gltfLoader.dracoLoader!
          dracoLoader.preload().decodeDracoFile(
            bufferView,
            function (geometry) {
              for (const attributeName in geometry.attributes) {
                const attribute = geometry.attributes[attributeName]
                const normalized = attributeNormalizedMap[attributeName]
                if (normalized !== undefined) attribute.normalized = normalized
              }
              resolve(geometry)
              reactor.stop()
            },
            threeAttributeMap,
            attributeTypeMap
          )
        }, [bufferView])
        return null
      })
    })
  }
}

export type KHRMeshOptExtensionType = {
  buffer: number
  byteOffset?: number
  byteLength?: number
  byteStride?: number
  count: number
  mode?: number
  filter?: number
}

/**
 * meshopt BufferView Compression Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_meshopt_compression
 */
export const EXT_MESHOPT_COMPRESSION = {
  loadBuffer: (options: GLTFParserOptions, bufferViewIndex: number) => {
    const json = options.document
    const bufferViewDef = json.bufferViews![bufferViewIndex]
    const extensionDef = bufferViewDef.extensions![EXTENSIONS.EXT_MESHOPT_COMPRESSION] as KHRMeshOptExtensionType
    return [
      extensionDef.buffer,
      (bufferView: ArrayBuffer) =>
        new Promise<ArrayBuffer | null>((resolve, reject) => {
          const json = options.document

          const byteOffset = extensionDef.byteOffset || 0
          const byteLength = extensionDef.byteLength || 0

          const count = extensionDef.count
          const stride = extensionDef.byteStride!

          const source = new Uint8Array(bufferView, byteOffset, byteLength)

          const decoder = getState(AssetLoaderState).gltfLoader.meshoptDecoder
          if (!decoder || !decoder.supported) {
            if (json.extensionsRequired && json.extensionsRequired.indexOf(EXTENSIONS.EXT_MESHOPT_COMPRESSION) >= 0) {
              return reject('THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files')
            } else {
              // Assumes that the extension is optional and that fallback buffer data is present
              return resolve(null)
            }
          }

          if (decoder.decodeGltfBufferAsync) {
            decoder
              .decodeGltfBufferAsync(count, stride, source, extensionDef.mode!, extensionDef.filter!)
              .then(function (res) {
                resolve(res.buffer)
              })
          } else {
            // Support for MeshoptDecoder 0.18 or earlier, without decodeGltfBufferAsync
            decoder.ready!.then(function () {
              const result = new ArrayBuffer(count * stride)
              decoder.decodeGltfBuffer(
                new Uint8Array(result),
                count,
                stride,
                source,
                extensionDef.mode!,
                extensionDef.filter!
              )
              resolve(result)
            })
          }
        })
    ] as [number | null, (bufferView: ArrayBuffer) => Promise<ArrayBuffer | null>]
  }
}

type GLTFExtensionType = {
  decodePrimitive?: (
    options: GLTFParserOptions,
    primitive: GLTF.IMeshPrimitive
  ) => Promise<BufferGeometry<NormalBufferAttributes>>
  loadBuffer?: (
    options: GLTFParserOptions,
    index: number
  ) => [number | null, (bufferView: ArrayBuffer) => Promise<ArrayBuffer | null>]
}

export const getBufferIndex = (options: GLTFParserOptions, bufferViewIndex?: number) => {
  const json = options.document
  if (typeof bufferViewIndex !== 'number')
    return [null, async (buffer: ArrayBuffer) => buffer] as [
      number | null,
      (bufferView: ArrayBuffer) => Promise<ArrayBuffer | null>
    ]
  const bufferViewDef = json.bufferViews![bufferViewIndex]
  for (const extensionName in bufferViewDef.extensions) {
    const extension = GLTFExtensions[extensionName]
    if (extension.loadBuffer) {
      return extension.loadBuffer(options, bufferViewIndex!)
    }
  }
  return [
    bufferViewDef.buffer,
    async (buffer) => {
      const byteLength = bufferViewDef!.byteLength || 0
      const byteOffset = bufferViewDef!.byteOffset || 0
      return buffer.slice(byteOffset, byteOffset + byteLength)
    }
  ] as [number | null, (bufferView: ArrayBuffer) => Promise<ArrayBuffer | null>]
}

export const GLTFExtensions = {
  [EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]: KHR_DRACO_MESH_COMPRESSION,
  [EXTENSIONS.EXT_MESHOPT_COMPRESSION]: EXT_MESHOPT_COMPRESSION
} as Record<string, GLTFExtensionType>
