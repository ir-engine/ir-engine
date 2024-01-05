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

import { DracoOptions } from '@gltf-transform/functions'
import { Material, Texture } from 'three'

import { SceneID } from '@etherealengine/common/src/schema.type.module'
import {
  GeometryTransformParameters,
  ImageTransformParameters,
  ResourceID,
  ResourceTransforms
} from '../../../assets/classes/ModelTransform'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { iterateEntityNode } from '../../../ecs/functions/EntityTree'
import { MeshComponent } from '../../components/MeshComponent'
import { ModelComponent } from '../../components/ModelComponent'
import { UUIDComponent } from '../../components/UUIDComponent'

export function getModelSceneID(entity: Entity): SceneID {
  if (!hasComponent(entity, ModelComponent)) {
    throw new Error('Entity does not have a ModelComponent')
  }
  if (!hasComponent(entity, UUIDComponent)) {
    throw new Error('Entity does not have a UUIDComponent')
  }
  return (getComponent(entity, UUIDComponent) + '-' + getComponent(entity, ModelComponent).src) as SceneID
}

export function getModelResources(entity: Entity): ResourceTransforms {
  const model = getComponent(entity, ModelComponent)
  if (!model?.scene) return { geometries: [], images: [] }
  const geometries: GeometryTransformParameters[] = iterateEntityNode(entity, (entity) => {
    if (!hasComponent(entity, MeshComponent)) return []
    const mesh = getComponent(entity, MeshComponent)
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
        isParameterOverride: true,
        enabled: true,
        parameters: {
          weld: {
            isParameterOverride: true,
            enabled: false,
            parameters: 0.0001
          },
          dracoCompression: {
            isParameterOverride: true,
            enabled: false,
            parameters: dracoParms
          }
        }
      } as GeometryTransformParameters
    })
    .filter((x, i, arr) => arr.indexOf(x) === i) // remove duplicates

  const images: ImageTransformParameters[] = iterateEntityNode(entity, (entity) => {
    const mesh = getComponent(entity, MeshComponent)
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
        isParameterOverride: true,
        enabled: false,
        parameters: {
          flipY: {
            enabled: false,
            isParameterOverride: true,
            parameters: false
          },
          maxTextureSize: {
            enabled: true,
            isParameterOverride: true,
            parameters: 1024
          },
          textureFormat: {
            enabled: true,
            isParameterOverride: true,
            parameters: 'ktx2'
          },
          textureCompressionType: {
            enabled: false,
            isParameterOverride: true,
            parameters: 'etc1'
          },
          textureCompressionQuality: {
            enabled: false,
            isParameterOverride: true,
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
