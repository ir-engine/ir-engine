import { getState } from '@etherealengine/hyperflux'
import { GLTF } from '@gltf-transform/core'
import { BufferGeometry, NormalBufferAttributes } from 'three'
import { ATTRIBUTES, WEBGL_COMPONENT_TYPES } from '../assets/loaders/gltf/GLTFConstants'
import { EXTENSIONS } from '../assets/loaders/gltf/GLTFExtensions'
import { GLTFParserOptions } from '../assets/loaders/gltf/GLTFParser'
import { AssetLoaderState } from '../assets/state/AssetLoaderState'
import { GLTFLoaderFunctions } from './GLTFLoaderFunctions'

const khr_draco_mesh_compression = {
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

export const GLTFExtensions = {
  [EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]: khr_draco_mesh_compression
}
