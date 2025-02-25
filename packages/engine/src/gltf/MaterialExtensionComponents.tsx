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
import { ComponentType, defineComponent, S } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import createReadableTexture from '@ir-engine/spatial/src/renderer/functions/createReadableTexture'
import { MaterialPrototypeDefinitions } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import {
  CanvasTexture,
  Color,
  LinearSRGBColorSpace,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  SRGBColorSpace,
  Texture,
  Vector2
} from 'three'
import { EXTENSIONS } from '../assets/loaders/gltf/GLTFExtensions'
import { getDependency, GLTFLoaderFunctions, GLTFParserOptions } from './GLTFLoaderFunctions'
import { NodeIDSchema } from './NodeIDComponent'

const TextureInfoSchema = S.Object({
  index: S.Number(),
  texCoord: S.Optional(S.Number()),
  extensions: S.Optional(S.Record(S.String(), S.Any())),
  extras: S.Optional(S.Record(S.String(), S.Any()))
})

const MaterialNormalTextureInfoSchema = S.Object({
  index: S.Number(),
  scale: S.Optional(S.Number()),
  texCoord: S.Optional(S.Number()),
  extensions: S.Optional(S.Record(S.String(), S.Any())),
  extras: S.Optional(S.Record(S.String(), S.Any()))
})

const MaterialMetallicRoughnessSchema = S.Object({
  baseColorFactor: S.Optional(S.Array(S.Number())),
  baseColorTexture: S.Optional(TextureInfoSchema),
  metallicFactor: S.Optional(S.Number()),
  roughnessFactor: S.Optional(S.Number()),
  metallicRoughnessTexture: S.Optional(TextureInfoSchema)
})

const MaterialOcclusionTextureInfoSchema = S.Object({
  index: S.Number(),
  strength: S.Optional(S.Number()),
  texCoord: S.Optional(S.Number()),
  extensions: S.Optional(S.Record(S.String(), S.Any())),
  extras: S.Optional(S.Record(S.String(), S.Any()))
})

const MaterialAlphaModeSchema = S.LiteralUnion(['OPAQUE', 'MASK', 'BLEND'])

const MaterialDefinitionSchema = S.Object({
  type: S.Union(
    [S.Literal('MeshStandardMaterial'), S.Literal('MeshPhysicalMaterial'), S.Literal('MeshBasicMaterial'), S.String()],
    'MeshStandardMaterial'
  ),

  name: S.Optional(S.String()),
  pbrMetallicRoughness: S.Optional(MaterialMetallicRoughnessSchema),
  normalTexture: S.Optional(MaterialNormalTextureInfoSchema),
  occlusionTexture: S.Optional(MaterialOcclusionTextureInfoSchema),
  emissiveTexture: S.Optional(TextureInfoSchema),
  emissiveFactor: S.Optional(S.Array(S.Number())),
  alphaMode: S.Optional(MaterialAlphaModeSchema),
  alphaCutoff: S.Optional(S.Number()),
  doubleSided: S.Optional(S.Bool()),
  extensions: S.Optional(S.Record(S.String(), S.Any())),
  extras: S.Optional(S.Record(S.String(), S.Any()))
})

/**
 * Unlit Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit
 */
export const KHRUnlitExtensionComponent = defineComponent({
  name: 'KHRUnlitExtensionComponent',
  jsonID: EXTENSIONS.KHR_MATERIALS_UNLIT,
  schema: S.Record(S.Any(), S.Any(), {}),

  getMaterialType() {
    return MeshBasicMaterial
  },

  extendMaterialParams(options: GLTFParserOptions, materialParams: any, materialDef: GLTF.IMaterial) {
    const pending = [] as Promise<void>[]

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
          GLTFLoaderFunctions.assignTexture(options, metallicRoughness.baseColorTexture).then((map) => {
            materialParams.map = map
            map.colorSpace = SRGBColorSpace
          })
        )
      }
    }

    return Promise.all(pending)
  }
})

/**
 * Materials Emissive Strength Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/blob/5768b3ce0ef32bc39cdf1bef10b948586635ead3/extensions/2.0/Khronos/KHR_materials_emissive_strength/README.md
 */
export const KHREmissiveStrengthExtensionComponent = defineComponent({
  name: 'KHREmissiveStrengthExtensionComponent',
  jsonID: EXTENSIONS.KHR_MATERIALS_EMISSIVE_STRENGTH,
  schema: S.Object({ emissiveStrength: S.Optional(S.Number()) }),

  extendMaterialParams(options: GLTFParserOptions, materialParams: any, materialDef: GLTF.IMaterial) {
    const extension = materialDef.extensions![KHREmissiveStrengthExtensionComponent.jsonID] as ComponentType<
      typeof KHREmissiveStrengthExtensionComponent
    >
    const emissiveStrength = extension.emissiveStrength

    if (emissiveStrength !== undefined) {
      materialParams.emissiveIntensity = emissiveStrength
    }

    return Promise.resolve()
  }
})

/**
 * Clearcoat Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_clearcoat
 */
export const KHRClearcoatExtensionComponent = defineComponent({
  name: 'KHRClearcoatExtensionComponent',
  jsonID: EXTENSIONS.KHR_MATERIALS_CLEARCOAT,
  schema: S.Object({
    clearcoatFactor: S.Optional(S.Number()),
    clearcoatTexture: S.Optional(TextureInfoSchema),
    clearcoatRoughnessFactor: S.Optional(S.Number()),
    clearcoatRoughnessTexture: S.Optional(TextureInfoSchema),
    clearcoatNormalTexture: S.Optional(MaterialNormalTextureInfoSchema)
  }),

  getMaterialType() {
    return MeshPhysicalMaterial
  },

  extendMaterialParams(options: GLTFParserOptions, materialParams: any, materialDef: GLTF.IMaterial) {
    const pending = [] as Promise<any>[]

    const extension = materialDef.extensions![KHRClearcoatExtensionComponent.jsonID] as ComponentType<
      typeof KHRClearcoatExtensionComponent
    >

    if (extension.clearcoatFactor !== undefined) {
      materialParams.clearcoat = extension.clearcoatFactor
    }

    if (extension.clearcoatTexture !== undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.clearcoatTexture).then((map) => {
          materialParams.clearcoatMap = map
        })
      )
    }

    if (extension.clearcoatRoughnessFactor !== undefined) {
      materialParams.clearcoatRoughness = extension.clearcoatRoughnessFactor
    }

    if (extension.clearcoatRoughnessTexture !== undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.clearcoatRoughnessTexture).then((map) => {
          materialParams.clearcoatRoughnessMap = map
        })
      )
    }

    if (extension.clearcoatNormalTexture !== undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.clearcoatNormalTexture).then((map) => {
          materialParams.clearcoatNormalMap = map
        })
      )

      if (extension.clearcoatNormalTexture.scale !== undefined) {
        const scale = extension.clearcoatNormalTexture.scale

        materialParams.clearcoatNormalScale = new Vector2(scale, scale)
      }
    }

    return Promise.all(pending)
  }
})

/**
 * Iridescence Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_iridescence
 */
export const KHRIridescenceExtensionComponent = defineComponent({
  name: 'KHRIridescenceExtensionComponent',
  jsonID: EXTENSIONS.KHR_MATERIALS_IRIDESCENCE,
  schema: S.Object({
    iridescenceFactor: S.Optional(S.Number()),
    iridescenceTexture: S.Optional(TextureInfoSchema),
    iridescenceIor: S.Optional(S.Number()),
    iridescenceThicknessMinimum: S.Optional(S.Number()),
    iridescenceThicknessMaximum: S.Optional(S.Number()),
    iridescenceThicknessTexture: S.Optional(TextureInfoSchema)
  }),

  getMaterialType() {
    return MeshPhysicalMaterial
  },

  extendMaterialParams(options: GLTFParserOptions, materialParams: any, materialDef: GLTF.IMaterial) {
    const pending = [] as Promise<any>[]

    const extension = materialDef.extensions![KHRIridescenceExtensionComponent.jsonID] as ComponentType<
      typeof KHRIridescenceExtensionComponent
    >
    if (extension.iridescenceFactor !== undefined) {
      materialParams.iridescence = extension.iridescenceFactor
    }

    if (extension.iridescenceTexture !== undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.iridescenceTexture).then((map) => {
          materialParams.iridescenceMap = map
        })
      )
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
        GLTFLoaderFunctions.assignTexture(options, extension.iridescenceThicknessTexture).then((map) => {
          materialParams.iridescenceThicknessMap = map
        })
      )
    }

    return Promise.all(pending)
  }
})

/**
 * Sheen Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_sheen
 */
export const KHRSheenExtensionComponent = defineComponent({
  name: 'KHRSheenExtensionComponent',
  jsonID: EXTENSIONS.KHR_MATERIALS_SHEEN,
  schema: S.Object({
    sheenColorFactor: S.Optional(S.Tuple([S.Number(), S.Number(), S.Number()])),
    sheenRoughnessFactor: S.Optional(S.Number()),
    sheenColorTexture: S.Optional(TextureInfoSchema),
    sheenRoughnessTexture: S.Optional(TextureInfoSchema)
  }),

  getMaterialType() {
    return MeshPhysicalMaterial
  },

  extendMaterialParams(options: GLTFParserOptions, materialParams: any, materialDef: GLTF.IMaterial) {
    const pending = [] as Promise<any>[]

    materialParams.sheenColor = new Color(0, 0, 0)
    materialParams.sheenRoughness = 0
    materialParams.sheen = 1

    const extension = materialDef.extensions![KHRSheenExtensionComponent.jsonID] as ComponentType<
      typeof KHRSheenExtensionComponent
    >

    if (extension.sheenColorFactor !== undefined) {
      const colorFactor = extension.sheenColorFactor
      materialParams.sheenColor.setRGB(colorFactor[0], colorFactor[1], colorFactor[2], LinearSRGBColorSpace)
    }

    if (extension.sheenRoughnessFactor !== undefined) {
      materialParams.sheenRoughness = extension.sheenRoughnessFactor
    }

    if (extension.sheenColorTexture !== undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.sheenColorTexture).then((map) => {
          materialParams.sheenColorMap = map
          map.colorSpace = SRGBColorSpace
        })
      )
    }

    if (extension.sheenRoughnessTexture !== undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.sheenRoughnessTexture).then((map) => {
          materialParams.sheenRoughnessMap = map
        })
      )
    }

    return Promise.all(pending)
  }
})

/**
 * Transmission Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_transmission
 * Draft: https://github.com/KhronosGroup/glTF/pull/1698
 */
export const KHRTransmissionExtensionComponent = defineComponent({
  name: 'KHRTransmissionExtensionComponent',
  jsonID: EXTENSIONS.KHR_MATERIALS_TRANSMISSION,
  schema: S.Object({
    transmissionFactor: S.Optional(S.Number()),
    transmissionTexture: S.Optional(TextureInfoSchema)
  }),

  getMaterialType() {
    return MeshPhysicalMaterial
  },

  extendMaterialParams(options: GLTFParserOptions, materialParams: any, materialDef: GLTF.IMaterial) {
    const pending = [] as Promise<any>[]

    const extension = materialDef.extensions![KHRTransmissionExtensionComponent.jsonID] as ComponentType<
      typeof KHRTransmissionExtensionComponent
    >
    if (extension.transmissionFactor !== undefined) {
      materialParams.transmission = extension.transmissionFactor
    }

    if (extension.transmissionTexture !== undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.transmissionTexture).then((map) => {
          materialParams.transmissionMap = map
        })
      )
    }

    return Promise.all(pending)
  }
})

/**
 * Materials Volume Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_volume
 */
export const KHRVolumeExtensionComponent = defineComponent({
  name: 'KHRVolumeExtensionComponent',
  jsonID: EXTENSIONS.KHR_MATERIALS_VOLUME,
  schema: S.Object({
    thicknessFactor: S.Optional(S.Number()),
    thicknessTexture: S.Optional(TextureInfoSchema),
    attenuationDistance: S.Optional(S.Number()),
    attenuationColor: S.Optional(S.Tuple([S.Number(), S.Number(), S.Number()]))
  }),

  getMaterialType() {
    return MeshPhysicalMaterial
  },

  extendMaterialParams(options: GLTFParserOptions, materialParams: any, materialDef: GLTF.IMaterial) {
    const pending = [] as Promise<any>[]

    const extension = materialDef.extensions![KHRVolumeExtensionComponent.jsonID] as ComponentType<
      typeof KHRVolumeExtensionComponent
    >
    materialParams.thickness = extension.thicknessFactor !== undefined ? extension.thicknessFactor : 0

    if (extension.thicknessTexture !== undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.thicknessTexture).then((map) => {
          materialParams.thicknessMap = map
        })
      )
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
})

/**
 * Materials ior Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_ior
 */
export const KHRIorExtensionComponent = defineComponent({
  name: 'KHRIorExtensionComponent',
  jsonID: EXTENSIONS.KHR_MATERIALS_IOR,
  schema: S.Object({
    ior: S.Optional(S.Number())
  }),

  getMaterialType() {
    return MeshPhysicalMaterial
  },

  extendMaterialParams(options: GLTFParserOptions, materialParams: any, materialDef: GLTF.IMaterial) {
    const extension = materialDef.extensions![KHRIorExtensionComponent.jsonID] as ComponentType<
      typeof KHRIorExtensionComponent
    >
    materialParams.ior = extension.ior !== undefined ? extension.ior : 1.5

    return Promise.resolve()
  }
})

/**
 * Materials specular Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_specular
 */
export const KHRSpecularExtensionComponent = defineComponent({
  name: 'KHRSpecularExtensionComponent',
  jsonID: EXTENSIONS.KHR_MATERIALS_SPECULAR,
  schema: S.Object({
    specularFactor: S.Optional(S.Number()),
    specularTexture: S.Optional(TextureInfoSchema),
    specularColorFactor: S.Optional(S.Tuple([S.Number(), S.Number(), S.Number()])),
    specularColorTexture: S.Optional(TextureInfoSchema)
  }),

  getMaterialType() {
    return MeshPhysicalMaterial
  },

  extendMaterialParams(options: GLTFParserOptions, materialParams: any, materialDef: GLTF.IMaterial) {
    const pending = [] as Promise<any>[]

    const extension = materialDef.extensions![KHRSpecularExtensionComponent.jsonID] as ComponentType<
      typeof KHRSpecularExtensionComponent
    >
    materialParams.specularIntensity = extension.specularFactor !== undefined ? extension.specularFactor : 1.0

    if (extension.specularTexture !== undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.specularTexture).then((map) => {
          materialParams.specularIntensityMap = map
        })
      )
    }

    const colorArray = extension.specularColorFactor || [1, 1, 1]
    materialParams.specularColor = new Color().setRGB(colorArray[0], colorArray[1], colorArray[2], LinearSRGBColorSpace)

    if (extension.specularColorTexture !== undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.specularColorTexture).then((map) => {
          materialParams.specularColorMap = map
          map.colorSpace = SRGBColorSpace
        })
      )
    }

    return Promise.all(pending)
  }
})

/**
 * Materials bump Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/EXT_materials_bump
 */
export const EXTBumpExtensionComponent = defineComponent({
  name: 'EXTBumpExtensionComponent',
  jsonID: EXTENSIONS.EXT_MATERIALS_BUMP,
  schema: S.Object({
    bumpFactor: S.Optional(S.Number()),
    bumpTexture: S.Optional(TextureInfoSchema)
  }),

  getMaterialType() {
    return MeshPhysicalMaterial
  },

  extendMaterialParams(options: GLTFParserOptions, materialParams: any, materialDef: GLTF.IMaterial) {
    const pending = [] as Promise<any>[]

    const extension = materialDef.extensions![EXTBumpExtensionComponent.jsonID] as ComponentType<
      typeof EXTBumpExtensionComponent
    >
    materialParams.bumpScale = extension.bumpFactor !== undefined ? extension.bumpFactor : 1.0

    if (extension.bumpTexture !== undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.bumpTexture).then((map) => {
          materialParams.bumpMap = map
        })
      )
    }

    return Promise.all(pending)
  }
})

/**
 * Materials anisotropy Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_anisotropy
 */
export const KHRAnisotropyExtensionComponent = defineComponent({
  name: 'KHRAnisotropyExtensionComponent',
  jsonID: EXTENSIONS.KHR_MATERIALS_ANISOTROPY,
  schema: S.Object({
    anisotropyStrength: S.Optional(S.Number()),
    anisotropyRotation: S.Optional(S.Number()),
    anisotropyTexture: S.Optional(TextureInfoSchema)
  }),

  getMaterialType() {
    return MeshPhysicalMaterial
  },

  extendMaterialParams(options: GLTFParserOptions, materialParams: any, materialDef: GLTF.IMaterial) {
    const pending = [] as Promise<any>[]

    const extension = materialDef.extensions![KHRAnisotropyExtensionComponent.jsonID] as ComponentType<
      typeof KHRAnisotropyExtensionComponent
    >
    if (extension.anisotropyStrength !== undefined) {
      materialParams.anisotropy = extension.anisotropyStrength
    }

    if (extension.anisotropyRotation !== undefined) {
      materialParams.anisotropyRotation = extension.anisotropyRotation
    }

    if (extension.anisotropyTexture !== undefined) {
      pending.push(
        GLTFLoaderFunctions.assignTexture(options, extension.anisotropyTexture).then((map) => {
          materialParams.anisotropyMap = map
        })
      )
    }

    return Promise.all(pending)
  }
})

type GLTFTextureTransformExtensionType = {
  texCoord?: number
  offset?: [number, number]
  rotation?: number
  scale?: [number, number]
}

/**
 * Texture Transform Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_transform
 */
export const KHRTextureTransformExtensionComponent = defineComponent({
  name: 'KHRTextureTransformExtensionComponent',
  jsonID: EXTENSIONS.KHR_TEXTURE_TRANSFORM,

  schema: S.Object({
    offset: S.Optional(S.Tuple([S.Number(), S.Number()])),
    rotation: S.Optional(S.Number()),
    scale: S.Optional(S.Tuple([S.Number(), S.Number()])),
    texCoord: S.Optional(S.Number())
  }),

  extendTexture: (texture: Texture, transform: GLTFTextureTransformExtensionType) => {
    if (
      (transform.texCoord === undefined || transform.texCoord === texture.channel) &&
      transform.offset === undefined &&
      transform.rotation === undefined &&
      transform.scale === undefined
    ) {
      // See https://github.com/mrdoob/three.js/issues/21819.
      return texture
    }

    /** @todo this throws hookstate 109... */
    // texture = texture.clone()

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
})

export const MozillaHubsLightMapComponent = defineComponent({
  name: 'MozillaHubsLightMapComponent',
  jsonID: 'MOZ_lightmap',
  schema: S.Object({
    index: S.Number(1),
    intensity: S.Number(1.0)
  }),

  extendMaterialParams(
    options: GLTFParserOptions,
    materialParams: any,
    materialDef: GLTF.IMaterial,
    materialIndex: number
  ) {
    const pending = [] as Promise<any>[]

    const extensionDef = materialDef.extensions![MozillaHubsLightMapComponent.jsonID] as ComponentType<
      typeof MozillaHubsLightMapComponent
    >

    pending.push(
      getDependency(options, 'texture', extensionDef.index).then((result) => {
        const lightMap: Texture = result!.clone()
        lightMap.channel = 1
        materialParams.lightMap = lightMap
        materialParams.lightMapIntensity = extensionDef.intensity ?? 1.0

        getDependency(options, 'material', materialIndex).then((result) => {
          // fix for change to MeshBasicMaterial shading WRT lightmaps
          if (result.type === 'MeshBasicMaterial') {
            result.lightMapIntensity *= Math.PI
          }
        })
      })
    )

    return Promise.all(pending)
  }
})

/**
 * @deprecated - use KHR_materials_ior and KHR_materials_specular instead
 */
export const KHRMaterialsPBRSpecularGlossinessComponent = defineComponent({
  name: 'KHRMaterialsPBRSpecularGlossinessComponent',
  jsonID: 'KHR_materials_pbrSpecularGlossiness',
  schema: S.Object({
    diffuseFactor: S.Optional(S.Tuple([S.Number(), S.Number(), S.Number(), S.Number()])),
    diffuseTexture: S.Optional(TextureInfoSchema),
    specularFactor: S.Optional(S.Tuple([S.Number(), S.Number(), S.Number()])),
    glossinessFactor: S.Optional(S.Number()),
    specularGlossinessTexture: S.Optional(TextureInfoSchema)
  })

  // reactor: () => {
  //   const entity = useEntityContext()
  //   const component = useComponent(entity, KHRMaterialsPBRSpecularGlossinessComponent)
  //   const materialStateComponent = useComponent(entity, MaterialStateComponent)

  //   useEffect(() => {
  //     setComponent(entity, MaterialDefinitionComponent, { type: 'MeshStandardMaterial' })
  //     console.warn(
  //       'KHR_materials_pbrSpecularGlossiness is deprecated. Use KHR_materials_ior and KHR_materials_specular instead.'
  //     )
  //   }, [])

  //   useEffect(() => {
  //     const material = materialStateComponent.material.value as MeshStandardMaterial
  //     material.setValues({
  //       color: new Color().fromArray(component.diffuseFactor.value ?? [1, 1, 1, 1]),
  //       opacity: component.diffuseFactor.value ? component.diffuseFactor.value[3] : 1
  //     })
  //     material.needsUpdate = true
  //   }, [materialStateComponent.material.value.type, component.diffuseFactor.value])

  //   useEffect(() => {
  //     const material = materialStateComponent.material.value as MeshStandardMaterial
  //     material.setValues({
  //       roughness: 1 - (component.glossinessFactor.value ?? 1)
  //     })
  //     material.needsUpdate = true
  //   }, [materialStateComponent.material.value.type, component.glossinessFactor.value])

  //   const options = getParserOptions(entity)
  //   const map = GLTFLoaderFunctions.useAssignTexture(options, component.diffuseTexture.get(NO_PROXY))

  //   useEffect(() => {
  //     const material = materialStateComponent.material.value as MeshStandardMaterial
  //     material.setValues({ map })
  //     material.needsUpdate = true
  //   }, [materialStateComponent.material.value.type, map])

  //   const specularGlossinessMap = GLTFLoaderFunctions.useAssignTexture(
  //     options,
  //     component.specularGlossinessTexture.get(NO_PROXY)
  //   )

  //   useEffect(() => {
  //     if (!specularGlossinessMap) return

  //     const abortController = new AbortController()

  //     invertGlossinessMap(specularGlossinessMap).then((invertedMap) => {
  //       if (abortController.signal.aborted) return

  //       const material = materialStateComponent.material.value as MeshStandardMaterial
  //       material.setValues({ roughnessMap: invertedMap })
  //       material.needsUpdate = true
  //     })

  //     return () => {
  //       abortController.abort()
  //     }
  //   }, [materialStateComponent.material.value.type, specularGlossinessMap])

  //   return null
  // }
})

const invertGlossinessMap = async (glossinessMap: Texture) => {
  const mapData: Texture = (await createReadableTexture(glossinessMap, { canvas: true })) as Texture
  const canvas = mapData.image as HTMLCanvasElement
  const ctx = canvas.getContext('2d')!
  ctx.globalCompositeOperation = 'difference'
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.globalCompositeOperation = 'source-over'
  const invertedTexture = new CanvasTexture(canvas)
  return invertedTexture
}

export type MaterialExtensionPluginType = { id: string; uniforms: { [key: string]: any } }
const MaterialExtensionPluginTypeSchema = S.Object({ id: S.String(), uniforms: S.Record(S.String(), S.Any()) })

export const EEMaterialComponent = defineComponent({
  name: 'EEMaterialComponent',
  jsonID: 'EE_material',
  schema: S.Object({
    uuid: NodeIDSchema(),
    name: S.String(),
    prototype: S.String(),
    args: S.Record(
      S.String(),
      S.Object({
        type: S.String(),
        contents: S.Any()
      })
    ),
    plugins: S.Array(MaterialExtensionPluginTypeSchema)
  }),

  getMaterialType(materialDef: GLTF.IMaterial) {
    const extension = materialDef.extensions![EEMaterialComponent.jsonID] as ComponentType<typeof EEMaterialComponent>
    return getState(MaterialPrototypeDefinitions)[extension.prototype]?.prototypeConstructor
  },

  extendMaterialParams(options: GLTFParserOptions, materialParams: any, materialDef: GLTF.IMaterial) {
    const pending = [] as Promise<any>[]

    const extension = materialDef.extensions![EEMaterialComponent.jsonID] as ComponentType<typeof EEMaterialComponent>
    const resultProperties = {} as Record<string, any>

    for (const [k, v] of Object.entries(extension.args)) {
      if (v.type === 'texture') {
        if (v.contents) {
          pending.push(
            GLTFLoaderFunctions.assignTexture(options, v.contents).then((texture) => {
              if (!texture) return
              if (k === 'map') texture.colorSpace = SRGBColorSpace
              materialParams[k] = texture
            })
          )
        } else {
          resultProperties[k] = null
        }
      } else if (v.type === 'color') {
        materialParams[k] = new Color(v.contents)
      } else {
        materialParams[k] = v.contents
      }
    }

    return Promise.all(pending)
  }
})
