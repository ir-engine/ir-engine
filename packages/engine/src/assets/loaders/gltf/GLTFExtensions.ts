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

/*********************************/
/********** EXTENSIONS ***********/
/*********************************/

import { GLTF } from '@gltf-transform/core'
import {
  BufferAttribute,
  Color,
  DirectionalLight,
  InstancedBufferAttribute,
  InstancedMesh,
  LinearSRGBColorSpace,
  Loader,
  Matrix4,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Object3D,
  PointLight,
  Quaternion,
  SpotLight,
  SRGBColorSpace,
  Vector2,
  Vector3
} from 'three'

import { DRACOLoader } from './DRACOLoader'
import { ATTRIBUTES, WEBGL_COMPONENT_TYPES, WEBGL_CONSTANTS } from './GLTFConstants'
import { assignExtrasToUserData } from './GLTFLoaderFunctions'
import { GLTFParser } from './GLTFParser'

export const EXTENSIONS = {
  KHR_BINARY_GLTF: 'KHR_binary_glTF' as const,
  KHR_DRACO_MESH_COMPRESSION: 'KHR_draco_mesh_compression' as const,
  KHR_LIGHTS_PUNCTUAL: 'KHR_lights_punctual' as const,
  KHR_MATERIALS_CLEARCOAT: 'KHR_materials_clearcoat' as const,
  KHR_MATERIALS_IOR: 'KHR_materials_ior' as const,
  KHR_MATERIALS_SHEEN: 'KHR_materials_sheen' as const,
  KHR_MATERIALS_SPECULAR: 'KHR_materials_specular' as const,
  KHR_MATERIALS_TRANSMISSION: 'KHR_materials_transmission' as const,
  KHR_MATERIALS_IRIDESCENCE: 'KHR_materials_iridescence' as const,
  KHR_MATERIALS_ANISOTROPY: 'KHR_materials_anisotropy' as const,
  KHR_MATERIALS_UNLIT: 'KHR_materials_unlit' as const,
  KHR_MATERIALS_VOLUME: 'KHR_materials_volume' as const,
  KHR_TEXTURE_BASISU: 'KHR_texture_basisu' as const,
  KHR_TEXTURE_TRANSFORM: 'KHR_texture_transform' as const,
  KHR_MESH_QUANTIZATION: 'KHR_mesh_quantization' as const,
  KHR_MATERIALS_EMISSIVE_STRENGTH: 'KHR_materials_emissive_strength' as const,
  EXT_MATERIALS_BUMP: 'EXT_materials_bump' as const,
  EXT_TEXTURE_WEBP: 'EXT_texture_webp' as const,
  EXT_TEXTURE_AVIF: 'EXT_texture_avif' as const,
  EXT_MESHOPT_COMPRESSION: 'EXT_meshopt_compression' as const,
  EXT_MESH_GPU_INSTANCING: 'EXT_mesh_gpu_instancing' as const,
  EE_MATERIAL: 'EE_material' as const
}

/**
 * Punctual Lights Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_lights_punctual
 */
export class GLTFLightsExtension {
  parser: GLTFParser
  name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL
  cache: { refs: any; uses: any }

  constructor(parser) {
    this.parser = parser

    // Object3D instance caches
    this.cache = { refs: {}, uses: {} }
  }

  _markDefs() {
    const parser = this.parser
    const nodeDefs = this.parser.json.nodes || []

    for (let nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex++) {
      const nodeDef = nodeDefs[nodeIndex]

      // @ts-ignore -- TODO type extensions
      if (nodeDef.extensions && nodeDef.extensions[this.name] && nodeDef.extensions[this.name].light !== undefined) {
        // @ts-ignore -- TODO type extensions
        parser._addNodeRef(this.cache, nodeDef.extensions[this.name].light)
      }
    }
  }

  _loadLight(lightIndex) {
    const parser = this.parser
    const cacheKey = 'light:' + lightIndex
    let dependency = parser.cache.get(cacheKey)

    if (dependency) return dependency

    const json = parser.json
    const extensions = (json.extensions && json.extensions[this.name]) || {}
    // @ts-ignore -- TODO type extensions
    const lightDefs = extensions.lights || []
    const lightDef = lightDefs[lightIndex]
    let lightNode

    const color = new Color(0xffffff)

    if (lightDef.color !== undefined)
      color.setRGB(lightDef.color[0], lightDef.color[1], lightDef.color[2], LinearSRGBColorSpace)

    const range = lightDef.range !== undefined ? lightDef.range : 0

    switch (lightDef.type) {
      case 'directional':
        lightNode = new DirectionalLight(color)
        lightNode.target.position.set(0, 0, -1)
        lightNode.add(lightNode.target)
        break

      case 'point':
        lightNode = new PointLight(color)
        lightNode.distance = range
        break

      case 'spot':
        lightNode = new SpotLight(color)
        lightNode.distance = range
        // Handle spotlight properties.
        lightDef.spot = lightDef.spot || {}
        lightDef.spot.innerConeAngle = lightDef.spot.innerConeAngle !== undefined ? lightDef.spot.innerConeAngle : 0
        lightDef.spot.outerConeAngle =
          lightDef.spot.outerConeAngle !== undefined ? lightDef.spot.outerConeAngle : Math.PI / 4.0
        lightNode.angle = lightDef.spot.outerConeAngle
        lightNode.penumbra = 1.0 - lightDef.spot.innerConeAngle / lightDef.spot.outerConeAngle
        lightNode.target.position.set(0, 0, -1)
        lightNode.add(lightNode.target)
        break

      default:
        throw new Error('THREE.GLTFLoader: Unexpected light type: ' + lightDef.type)
    }

    // Some lights (e.g. spot) default to a position other than the origin. Reset the position
    // here, because node-level parsing will only override position if explicitly specified.
    lightNode.position.set(0, 0, 0)

    lightNode.decay = 2

    assignExtrasToUserData(lightNode, lightDef)

    if (lightDef.intensity !== undefined) lightNode.intensity = lightDef.intensity

    lightNode.name = parser.createUniqueName(lightDef.name || 'light_' + lightIndex)

    dependency = Promise.resolve(lightNode)

    parser.cache.add(cacheKey, dependency)

    return dependency
  }

  getDependency(type, index) {
    if (type !== 'light') return

    return this._loadLight(index)
  }

  createNodeAttachment(nodeIndex) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    const parser = this.parser
    const json = parser.json
    const nodeDef = json.nodes?.[nodeIndex]!
    const lightDef = (nodeDef.extensions && nodeDef.extensions[this.name]) || {}
    // @ts-ignore -- TODO type extensions
    const lightIndex = lightDef.light

    if (lightIndex === undefined) return null

    return this._loadLight(lightIndex).then(function (light) {
      return parser._getNodeRef(self.cache, lightIndex, light)
    })
  }
}

/**
 * Unlit Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit
 */
export class GLTFMaterialsUnlitExtension {
  name = EXTENSIONS.KHR_MATERIALS_UNLIT

  getMaterialType() {
    return MeshBasicMaterial
  }

  extendParams(materialParams, materialDef, parser) {
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
        pending.push(parser.assignTexture(materialParams, 'map', metallicRoughness.baseColorTexture, SRGBColorSpace))
      }
    }

    return Promise.all(pending)
  }
}

/**
 * Materials Emissive Strength Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/blob/5768b3ce0ef32bc39cdf1bef10b948586635ead3/extensions/2.0/Khronos/KHR_materials_emissive_strength/README.md
 */
export class GLTFMaterialsEmissiveStrengthExtension {
  parser: GLTFParser
  name = EXTENSIONS.KHR_MATERIALS_EMISSIVE_STRENGTH

  constructor(parser) {
    this.parser = parser
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials?.[materialIndex]

    // @ts-ignore -- TODO type extensions
    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    // @ts-ignore -- TODO type extensions
    const emissiveStrength = materialDef.extensions[this.name].emissiveStrength

    if (emissiveStrength !== undefined) {
      materialParams.emissiveIntensity = emissiveStrength
    }

    return Promise.resolve()
  }
}

/**
 * Clearcoat Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_clearcoat
 */
export class GLTFMaterialsClearcoatExtension {
  parser: GLTFParser
  name = EXTENSIONS.KHR_MATERIALS_CLEARCOAT

  constructor(parser) {
    this.parser = parser
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    const materialDef = parser.json.materials?.[materialIndex]

    if (!materialDef?.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials?.[materialIndex]

    if (!materialDef?.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = [] as Promise<any>[]

    const extension = materialDef.extensions[this.name] as any // TODO type extensions

    if (extension.clearcoatFactor !== undefined) {
      materialParams.clearcoat = extension.clearcoatFactor
    }

    if (extension.clearcoatTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'clearcoatMap', extension.clearcoatTexture))
    }

    if (extension.clearcoatRoughnessFactor !== undefined) {
      materialParams.clearcoatRoughness = extension.clearcoatRoughnessFactor
    }

    if (extension.clearcoatRoughnessTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'clearcoatRoughnessMap', extension.clearcoatRoughnessTexture))
    }

    if (extension.clearcoatNormalTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'clearcoatNormalMap', extension.clearcoatNormalTexture))

      if (extension.clearcoatNormalTexture.scale !== undefined) {
        const scale = extension.clearcoatNormalTexture.scale

        materialParams.clearcoatNormalScale = new Vector2(scale, scale)
      }
    }

    return Promise.all(pending)
  }
}

/**
 * Iridescence Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_iridescence
 */
export class GLTFMaterialsIridescenceExtension {
  parser: GLTFParser
  name = EXTENSIONS.KHR_MATERIALS_IRIDESCENCE

  constructor(parser) {
    this.parser = parser
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    // @ts-ignore -- TODO type extensions
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    // @ts-ignore -- TODO type extensions
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = [] as Promise<any>[]

    const extension = materialDef.extensions[this.name] as any // TODO type extensions

    if (extension.iridescenceFactor !== undefined) {
      materialParams.iridescence = extension.iridescenceFactor
    }

    if (extension.iridescenceTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'iridescenceMap', extension.iridescenceTexture))
    }

    if (extension.iridescenceIor !== undefined) {
      materialParams.iridescenceIOR = extension.iridescenceIor
    }

    if (materialParams.iridescenceThicknessRange === undefined) {
      materialParams.iridescenceThicknessRange = [100, 400]
    }

    if (extension.iridescenceThicknessMinimum !== undefined) {
      materialParams.iridescenceThicknessRange[0] = extension.iridescenceThicknessMinimum
    }

    if (extension.iridescenceThicknessMaximum !== undefined) {
      materialParams.iridescenceThicknessRange[1] = extension.iridescenceThicknessMaximum
    }

    if (extension.iridescenceThicknessTexture !== undefined) {
      pending.push(
        parser.assignTexture(materialParams, 'iridescenceThicknessMap', extension.iridescenceThicknessTexture)
      )
    }

    return Promise.all(pending)
  }
}

/**
 * Sheen Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_sheen
 */
export class GLTFMaterialsSheenExtension {
  parser: GLTFParser
  name = EXTENSIONS.KHR_MATERIALS_SHEEN

  constructor(parser) {
    this.parser = parser
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    // @ts-ignore -- TODO type extensions
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    // @ts-ignore -- TODO type extensions
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = [] as Promise<any>[]

    materialParams.sheenColor = new Color(0, 0, 0)
    materialParams.sheenRoughness = 0
    materialParams.sheen = 1

    const extension = materialDef.extensions[this.name] as any // TODO type extensions

    if (extension.sheenColorFactor !== undefined) {
      const colorFactor = extension.sheenColorFactor
      materialParams.sheenColor.setRGB(colorFactor[0], colorFactor[1], colorFactor[2], LinearSRGBColorSpace)
    }

    if (extension.sheenRoughnessFactor !== undefined) {
      materialParams.sheenRoughness = extension.sheenRoughnessFactor
    }

    if (extension.sheenColorTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'sheenColorMap', extension.sheenColorTexture, SRGBColorSpace))
    }

    if (extension.sheenRoughnessTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'sheenRoughnessMap', extension.sheenRoughnessTexture))
    }

    return Promise.all(pending)
  }
}

/**
 * Transmission Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_transmission
 * Draft: https://github.com/KhronosGroup/glTF/pull/1698
 */
export class GLTFMaterialsTransmissionExtension {
  parser: GLTFParser
  name = EXTENSIONS.KHR_MATERIALS_TRANSMISSION

  constructor(parser) {
    this.parser = parser
  }

  getMaterialType(materialIndex) {
    const parser = this.parser

    // @ts-ignore -- TODO type extensions
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    // @ts-ignore -- TODO type extensions
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = [] as Promise<any>[]

    const extension = materialDef.extensions[this.name] as any // TODO type extensions

    if (extension.transmissionFactor !== undefined) {
      materialParams.transmission = extension.transmissionFactor
    }

    if (extension.transmissionTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'transmissionMap', extension.transmissionTexture))
    }

    return Promise.all(pending)
  }
}

/**
 * Materials Volume Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_volume
 */
export class GLTFMaterialsVolumeExtension {
  parser: GLTFParser
  name = EXTENSIONS.KHR_MATERIALS_VOLUME

  constructor(parser) {
    this.parser = parser
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    // @ts-ignore -- TODO type extensions
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    // @ts-ignore -- TODO type extensions
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = [] as Promise<any>[]

    const extension = materialDef.extensions[this.name] as any // TODO type extensions

    materialParams.thickness = extension.thicknessFactor !== undefined ? extension.thicknessFactor : 0

    if (extension.thicknessTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'thicknessMap', extension.thicknessTexture))
    }

    materialParams.attenuationDistance = extension.attenuationDistance || Infinity

    const colorArray = extension.attenuationColor || [1, 1, 1]
    materialParams.attenuationColor = new Color().setRGB(
      colorArray[0],
      colorArray[1],
      colorArray[2],
      LinearSRGBColorSpace
    )

    return Promise.all(pending)
  }
}

/**
 * Materials ior Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_ior
 */
export class GLTFMaterialsIorExtension {
  parser: GLTFParser
  name = EXTENSIONS.KHR_MATERIALS_IOR

  constructor(parser) {
    this.parser = parser
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    // @ts-ignore -- TODO type extensions
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    // @ts-ignore -- TODO type extensions
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const extension = materialDef.extensions[this.name] as any // TODO type extensions

    materialParams.ior = extension.ior !== undefined ? extension.ior : 1.5

    return Promise.resolve()
  }
}

/**
 * Materials specular Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_specular
 */
export class GLTFMaterialsSpecularExtension {
  parser: GLTFParser
  name = EXTENSIONS.KHR_MATERIALS_SPECULAR

  constructor(parser) {
    this.parser = parser
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    // @ts-ignore -- TODO type extensions
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    // @ts-ignore -- TODO type extensions
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = [] as Promise<any>[]

    const extension = materialDef.extensions[this.name] as any // TODO type extensions

    materialParams.specularIntensity = extension.specularFactor !== undefined ? extension.specularFactor : 1.0

    if (extension.specularTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'specularIntensityMap', extension.specularTexture))
    }

    const colorArray = extension.specularColorFactor || [1, 1, 1]
    materialParams.specularColor = new Color().setRGB(colorArray[0], colorArray[1], colorArray[2], LinearSRGBColorSpace)

    if (extension.specularColorTexture !== undefined) {
      pending.push(
        parser.assignTexture(materialParams, 'specularColorMap', extension.specularColorTexture, SRGBColorSpace)
      )
    }

    return Promise.all(pending)
  }
}

/**
 * Materials bump Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/EXT_materials_bump
 */
export class GLTFMaterialsBumpExtension {
  parser: GLTFParser
  name = EXTENSIONS.EXT_MATERIALS_BUMP

  constructor(parser) {
    this.parser = parser
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    // @ts-ignore -- TODO type extensions
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    // @ts-ignore -- TODO type extensions
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = [] as Promise<any>[]

    const extension = materialDef.extensions[this.name] as any // TODO type extensions

    materialParams.bumpScale = extension.bumpFactor !== undefined ? extension.bumpFactor : 1.0

    if (extension.bumpTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'bumpMap', extension.bumpTexture))
    }

    return Promise.all(pending)
  }
}

/**
 * Materials anisotropy Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_anisotropy
 */
export class GLTFMaterialsAnisotropyExtension {
  parser: GLTFParser
  name = EXTENSIONS.KHR_MATERIALS_ANISOTROPY

  constructor(parser) {
    this.parser = parser
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    // @ts-ignore -- TODO type extensions
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    // @ts-ignore -- TODO type extensions
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = [] as Promise<any>[]

    const extension = materialDef.extensions[this.name] as any // TODO type extensions

    if (extension.anisotropyStrength !== undefined) {
      materialParams.anisotropy = extension.anisotropyStrength
    }

    if (extension.anisotropyRotation !== undefined) {
      materialParams.anisotropyRotation = extension.anisotropyRotation
    }

    if (extension.anisotropyTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'anisotropyMap', extension.anisotropyTexture))
    }

    return Promise.all(pending)
  }
}

/**
 * BasisU Texture Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_basisu
 */
export class GLTFTextureBasisUExtension {
  parser: GLTFParser
  name = EXTENSIONS.KHR_TEXTURE_BASISU

  constructor(parser) {
    this.parser = parser
  }

  loadTexture(textureIndex) {
    const parser = this.parser
    const json = parser.json
    /*
    // if no texture at textureIndex, check if image exists
    if ( ! json.textures[textureIndex] && json.images[ textureIndex ]) {
      //if image exists, create textureDef for it
      json.textures[textureIndex] = {
        source: textureIndex,
        sampler: 0
      }
    }*/

    // @ts-ignore -- TODO type extensions
    const textureDef = json.textures[textureIndex]

    if (!textureDef.extensions || !textureDef.extensions[this.name]) {
      return null
    }

    const extension = textureDef.extensions[this.name] as any // TODO type extensions
    const loader = parser.options.ktx2Loader

    if (!loader) {
      if (json.extensionsRequired && json.extensionsRequired.indexOf(this.name) >= 0) {
        throw new Error('THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures')
      } else {
        // Assumes that the extension is optional and that a fallback texture is present
        return null
      }
    }

    return parser.loadTextureImage(textureIndex, extension.source, loader)
  }
}

/**
 * WebP Texture Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_texture_webp
 */
export class GLTFTextureWebPExtension {
  parser: GLTFParser
  name = EXTENSIONS.EXT_TEXTURE_WEBP
  isSupported = null as null | Promise<boolean>

  constructor(parser) {
    this.parser = parser
  }

  loadTexture(textureIndex) {
    const name = this.name
    const parser = this.parser
    const json = parser.json

    // @ts-ignore -- TODO type extensions
    const textureDef = json.textures[textureIndex]

    if (!textureDef.extensions || !textureDef.extensions[name]) {
      return null
    }

    const extension = textureDef.extensions[name] as any // TODO type extensions
    // @ts-ignore -- TODO type extensions
    const source = json.images[extension.source]

    let loader = parser.textureLoader as Loader
    if (source.uri) {
      const handler = parser.options.manager.getHandler(source.uri)
      if (handler !== null) loader = handler
    }

    return this.detectSupport().then(function (isSupported) {
      if (isSupported) return parser.loadTextureImage(textureIndex, extension.source, loader)

      if (json.extensionsRequired && json.extensionsRequired.indexOf(name) >= 0) {
        throw new Error('THREE.GLTFLoader: WebP required by asset but unsupported.')
      }

      // Fall back to PNG or JPEG.
      return parser.loadTexture(textureIndex)
    })
  }

  detectSupport() {
    if (!this.isSupported) {
      this.isSupported = new Promise(function (resolve) {
        const image = new Image()

        // Lossy test image. Support for lossy images doesn't guarantee support for all
        // WebP images, unfortunately.
        image.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA'

        image.onload = image.onerror = function () {
          resolve(image.height === 1)
        }
      })
    }

    return this.isSupported
  }
}

/**
 * AVIF Texture Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_texture_avif
 */
export class GLTFTextureAVIFExtension {
  parser: GLTFParser
  name = EXTENSIONS.EXT_TEXTURE_AVIF
  isSupported = null as null | Promise<boolean>

  constructor(parser) {
    this.parser = parser
  }

  loadTexture(textureIndex) {
    const name = this.name
    const parser = this.parser
    const json = parser.json

    // @ts-ignore -- TODO type extensions
    const textureDef = json.textures[textureIndex]

    if (!textureDef.extensions || !textureDef.extensions[name]) {
      return null
    }

    const extension = textureDef.extensions[name] as any // TODO type extensions
    // @ts-ignore -- TODO type extensions
    const source = json.images[extension.source]

    let loader = parser.textureLoader as Loader
    if (source.uri) {
      const handler = parser.options.manager.getHandler(source.uri)
      if (handler !== null) loader = handler
    }

    return this.detectSupport().then(function (isSupported) {
      if (isSupported) return parser.loadTextureImage(textureIndex, extension.source, loader)

      if (json.extensionsRequired && json.extensionsRequired.indexOf(name) >= 0) {
        throw new Error('THREE.GLTFLoader: AVIF required by asset but unsupported.')
      }

      // Fall back to PNG or JPEG.
      return parser.loadTexture(textureIndex)
    })
  }

  detectSupport() {
    if (!this.isSupported) {
      this.isSupported = new Promise(function (resolve) {
        const image = new Image()

        // Lossy test image.
        image.src =
          'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI='
        image.onload = image.onerror = function () {
          resolve(image.height === 1)
        }
      })
    }

    return this.isSupported
  }
}

/**
 * meshopt BufferView Compression Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_meshopt_compression
 */
export class GLTFMeshoptCompression {
  parser: GLTFParser
  name = EXTENSIONS.EXT_MESHOPT_COMPRESSION

  constructor(parser) {
    this.parser = parser
  }

  loadBufferView(index) {
    const json = this.parser.json
    // @ts-ignore -- TODO type extensions
    const bufferView = json.bufferViews[index]

    if (bufferView.extensions && bufferView.extensions[this.name]) {
      const extensionDef = bufferView.extensions[this.name] as any // TODO type extensions

      const buffer = this.parser.getDependency('buffer', extensionDef.buffer)
      const decoder = this.parser.options.meshoptDecoder

      if (!decoder || !decoder.supported) {
        if (json.extensionsRequired && json.extensionsRequired.indexOf(this.name) >= 0) {
          throw new Error('THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files')
        } else {
          // Assumes that the extension is optional and that fallback buffer data is present
          return null
        }
      }

      return buffer.then(function (res) {
        const byteOffset = extensionDef.byteOffset || 0
        const byteLength = extensionDef.byteLength || 0

        const count = extensionDef.count
        const stride = extensionDef.byteStride

        const source = new Uint8Array(res, byteOffset, byteLength)

        if (decoder.decodeGltfBufferAsync) {
          return decoder
            .decodeGltfBufferAsync(count, stride, source, extensionDef.mode, extensionDef.filter)
            .then(function (res) {
              return res.buffer
            })
        } else {
          // Support for MeshoptDecoder 0.18 or earlier, without decodeGltfBufferAsync
          return decoder.ready.then(function () {
            const result = new ArrayBuffer(count * stride)
            decoder.decodeGltfBuffer(
              new Uint8Array(result),
              count,
              stride,
              source,
              extensionDef.mode,
              extensionDef.filter
            )
            return result
          })
        }
      })
    } else {
      return null
    }
  }
}

/**
 * GPU Instancing Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_mesh_gpu_instancing
 *
 */
export class GLTFMeshGpuInstancing {
  parser: GLTFParser
  name = EXTENSIONS.EXT_MESH_GPU_INSTANCING

  constructor(parser) {
    this.parser = parser
  }

  createNodeMesh(nodeIndex) {
    const json = this.parser.json
    // @ts-ignore -- TODO type extensions
    const nodeDef = json.nodes[nodeIndex]

    if (!nodeDef.extensions || !nodeDef.extensions[this.name] || nodeDef.mesh === undefined) {
      return null
    }

    // @ts-ignore -- TODO type extensions
    const meshDef = json.meshes[nodeDef.mesh]

    // No Points or Lines + Instancing support yet

    for (const primitive of meshDef.primitives) {
      if (
        primitive.mode !== WEBGL_CONSTANTS.TRIANGLES &&
        primitive.mode !== WEBGL_CONSTANTS.TRIANGLE_STRIP &&
        primitive.mode !== WEBGL_CONSTANTS.TRIANGLE_FAN &&
        primitive.mode !== undefined
      ) {
        return null
      }
    }

    const extensionDef = nodeDef.extensions[this.name] as any // TODO type extensions
    const attributesDef = extensionDef.attributes

    // @TODO: Can we support InstancedMesh + SkinnedMesh?

    const pending = [] as Promise<any>[]
    const attributes = {} as { [key: string]: BufferAttribute }

    for (const key in attributesDef) {
      pending.push(
        this.parser.getDependency('accessor', attributesDef[key]).then((accessor) => {
          attributes[key] = accessor
          return attributes[key]
        })
      )
    }

    if (pending.length < 1) {
      return null
    }

    pending.push(this.parser.createNodeMesh(nodeIndex))

    return Promise.all(pending).then((results) => {
      const nodeObject = results.pop()
      const meshes = nodeObject.isGroup ? nodeObject.children : [nodeObject]
      const count = results[0].count // All attribute counts should be same
      const instancedMeshes = [] as InstancedMesh[]

      for (const mesh of meshes) {
        // Temporal variables
        const m = new Matrix4()
        const p = new Vector3()
        const q = new Quaternion()
        const s = new Vector3(1, 1, 1)

        const instancedMesh = new InstancedMesh(mesh.geometry, mesh.material, count)

        for (let i = 0; i < count; i++) {
          if (attributes.TRANSLATION) {
            p.fromBufferAttribute(attributes.TRANSLATION, i)
          }

          if (attributes.ROTATION) {
            q.fromBufferAttribute(attributes.ROTATION, i)
          }

          if (attributes.SCALE) {
            s.fromBufferAttribute(attributes.SCALE, i)
          }

          instancedMesh.setMatrixAt(i, m.compose(p, q, s))
        }

        // Add instance attributes to the geometry, excluding TRS.
        for (const attributeName in attributes) {
          if (attributeName === '_COLOR_0') {
            const attr = attributes[attributeName]
            instancedMesh.instanceColor = new InstancedBufferAttribute(attr.array, attr.itemSize, attr.normalized)
          } else if (attributeName !== 'TRANSLATION' && attributeName !== 'ROTATION' && attributeName !== 'SCALE') {
            mesh.geometry.setAttribute(attributeName, attributes[attributeName])
          }
        }

        // Just in case
        Object3D.prototype.copy.call(instancedMesh, mesh)

        // https://github.com/mrdoob/three.js/issues/18334
        instancedMesh.frustumCulled = false
        this.parser.assignFinalMaterial(instancedMesh)

        instancedMeshes.push(instancedMesh)
      }

      if (nodeObject.isGroup) {
        nodeObject.clear()

        nodeObject.add(...instancedMeshes)

        return nodeObject
      }

      return instancedMeshes[0]
    })
  }
}

/* BINARY EXTENSION */
export const BINARY_EXTENSION_HEADER_MAGIC = 'glTF'
export const BINARY_EXTENSION_HEADER_LENGTH = 12
export const BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4e4f534a, BIN: 0x004e4942 }

export class GLTFBinaryExtension {
  name = EXTENSIONS.KHR_BINARY_GLTF
  content: string | null = null
  body: ArrayBuffer | null = null
  header: { magic: string; version: number; length: number }

  constructor(data) {
    const headerView = new DataView(data, 0, BINARY_EXTENSION_HEADER_LENGTH)
    const textDecoder = new TextDecoder()

    this.header = {
      magic: textDecoder.decode(new Uint8Array(data.slice(0, 4))),
      version: headerView.getUint32(4, true),
      length: headerView.getUint32(8, true)
    }

    if (this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC) {
      throw new Error('THREE.GLTFLoader: Unsupported glTF-Binary header.')
    } else if (this.header.version < 2.0) {
      throw new Error('THREE.GLTFLoader: Legacy binary file detected.')
    }

    const chunkContentsLength = this.header.length - BINARY_EXTENSION_HEADER_LENGTH
    const chunkView = new DataView(data, BINARY_EXTENSION_HEADER_LENGTH)
    let chunkIndex = 0

    while (chunkIndex < chunkContentsLength) {
      const chunkLength = chunkView.getUint32(chunkIndex, true)
      chunkIndex += 4

      const chunkType = chunkView.getUint32(chunkIndex, true)
      chunkIndex += 4

      if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON) {
        const contentArray = new Uint8Array(data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength)
        this.content = textDecoder.decode(contentArray)
      } else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {
        const byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex
        this.body = data.slice(byteOffset, byteOffset + chunkLength)
      }

      // Clients must ignore chunks with unknown types.

      chunkIndex += chunkLength
    }

    if (this.content === null) {
      throw new Error('THREE.GLTFLoader: JSON content not found.')
    }
  }
}

/**
 * DRACO Mesh Compression Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_draco_mesh_compression
 */
export class GLTFDracoMeshCompressionExtension {
  name = EXTENSIONS.KHR_DRACO_MESH_COMPRESSION
  json: GLTF.IGLTF
  dracoLoader: DRACOLoader

  constructor(json, dracoLoader) {
    if (!dracoLoader) {
      throw new Error('THREE.GLTFLoader: No DRACOLoader instance provided.')
    }

    this.json = json
    this.dracoLoader = dracoLoader
    this.dracoLoader.preload()
  }

  decodePrimitive(primitive, parser) {
    const json = this.json
    const dracoLoader = this.dracoLoader
    const bufferViewIndex = primitive.extensions[this.name].bufferView
    const gltfAttributeMap = primitive.extensions[this.name].attributes
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

    return parser.getDependency('bufferView', bufferViewIndex).then(function (bufferView) {
      return new Promise(function (resolve) {
        dracoLoader.decodeDracoFile(
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

/**
 * Texture Transform Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_transform
 */
export class GLTFTextureTransformExtension {
  name = EXTENSIONS.KHR_TEXTURE_TRANSFORM

  extendTexture(texture, transform) {
    if (
      (transform.texCoord === undefined || transform.texCoord === texture.channel) &&
      transform.offset === undefined &&
      transform.rotation === undefined &&
      transform.scale === undefined
    ) {
      // See https://github.com/mrdoob/three.js/issues/21819.
      return texture
    }

    texture = texture.clone()

    if (transform.texCoord !== undefined) {
      texture.channel = transform.texCoord
    }

    if (transform.offset !== undefined) {
      texture.offset.fromArray(transform.offset)
    }

    if (transform.rotation !== undefined) {
      texture.rotation = transform.rotation
    }

    if (transform.scale !== undefined) {
      texture.repeat.fromArray(transform.scale)
    }

    texture.needsUpdate = true

    return texture
  }
}

/**
 * Mesh Quantization Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_mesh_quantization
 */
export class GLTFMeshQuantizationExtension {
  name = EXTENSIONS.KHR_MESH_QUANTIZATION
}
