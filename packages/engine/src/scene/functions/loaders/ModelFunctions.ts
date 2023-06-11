import { DracoOptions } from '@gltf-transform/functions'
import { Material, Mesh, Texture } from 'three'

import {
  GeometryTransformParameters,
  ImageTransformParameters,
  ResourceID,
  ResourceTransforms
} from '../../../assets/classes/ModelTransform'
import { ComponentType } from '../../../ecs/functions/ComponentFunctions'
import { ModelComponent } from '../../components/ModelComponent'
import iterateObject3D from '../../util/iterateObject3D'

export function getModelResources(model: ComponentType<typeof ModelComponent>): ResourceTransforms {
  if (!model?.scene) return { geometries: [], images: [] }
  const geometries: GeometryTransformParameters[] = iterateObject3D(model.scene, (mesh: Mesh) => {
    if (!mesh?.isMesh || !mesh.geometry) return []
    mesh.name && (mesh.geometry.name = mesh.name)
    return [mesh.geometry]
  })
    .flatMap((x) => x)
    .map((geometry) => {
      const dracoParms: DracoOptions = {
        quantizePosition: 14,
        quantizeNormal: 10,
        quantizeTexcoord: 12,
        quantizeColor: 8,
        quantizeGeneric: 12
      }
      return {
        resourceId: geometry.uuid as ResourceID,
        enabled: true,
        parameters: {
          weld: {
            enabled: false,
            parameters: 0.0001
          },
          dracoCompression: {
            enabled: false,
            parameters: dracoParms
          }
        }
      } as GeometryTransformParameters
    })
    .filter((x, i, arr) => arr.indexOf(x) === i) // remove duplicates

  const images: ImageTransformParameters[] = iterateObject3D(model.scene, (mesh: Mesh) => {
    if (!mesh?.isMesh || !mesh.material) return []
    const textures: Texture[] = Object.entries(mesh.material)
      .filter(([, x]) => x?.isTexture)
      .map(([field, texture]) => {
        texture.name = texture.name ? texture.name : `${(mesh.material as Material).name}-${field}`
        return texture
      })
    const tmpImages: HTMLImageElement[] = textures.map((texture) => texture.image)
    const images: HTMLImageElement[] = textures
      .filter((texture, i, arr) => tmpImages.indexOf(tmpImages[i]) === i)
      .map((texture) => {
        const image = texture.image as HTMLImageElement
        image.id = texture.name
        return image
      })
    const result: ImageTransformParameters[] = images.map((image) => {
      return {
        resourceId: image.id as ResourceID,
        enabled: false,
        parameters: {
          flipY: {
            enabled: false,
            parameters: false
          },
          maxTextureSize: {
            enabled: true,
            parameters: 2048
          },
          textureFormat: {
            enabled: true,
            parameters: 'ktx2'
          },
          textureCompressionType: {
            enabled: false,
            parameters: 'etc1'
          },
          textureCompressionQuality: {
            enabled: false,
            parameters: 128
          }
        }
      } as ImageTransformParameters
    })
    return result
  })
    .flatMap((x) => x)
    .filter((x, i, arr) => arr.indexOf(x) === i) // remove duplicates
  return {
    geometries,
    images
  }
}
