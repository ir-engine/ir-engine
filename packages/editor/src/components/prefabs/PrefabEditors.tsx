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
import config from '@etherealengine/common/src/config'
import { defineState } from '@etherealengine/hyperflux'
import React, { ReactNode } from 'react'
import { FiHexagon } from 'react-icons/fi'

export type PrefabShelfItem = {
  name: string
  url: string
  category: string
  detail?: string
}

export const PrefabIcons: Record<string, ReactNode> = {
  Geo: <FiHexagon size="1.25rem" />,
  default: <FiHexagon size="1.25rem" />
}

export const PrefabShelfState = defineState({
  name: 'ee.editor.PrefabShelfItem',
  initial: () =>
    [
      {
        name: '3D Model',
        url: `${config.client.fileServer}/projects/default-project/assets/prefabs/3d-model.prefab.gltf`,
        category: 'Geo',
        detail: 'Blank 3D model ready for your own assets'
      },
      {
        name: 'Primitive Geometry',
        url: `${config.client.fileServer}/projects/default-project/assets/prefabs/geo.prefab.gltf`,
        category: 'Geo'
      },
      {
        name: 'Ground Plane',
        url: `${config.client.fileServer}/projects/default-project/assets/prefabs/ground-plane.prefab.gltf`,
        category: 'Geo'
      },
      {
        name: 'Point Light',
        url: `${config.client.fileServer}/projects/default-project/assets/prefabs/point-light.prefab.gltf`,
        category: 'Lighting'
      },
      {
        name: 'Spot Light',
        url: `${config.client.fileServer}/projects/default-project/assets/prefabs/spot-light.prefab.gltf`,
        category: 'Lighting'
      },
      {
        name: 'Directional Light',
        url: `${config.client.fileServer}/projects/default-project/assets/prefabs/directional-light.prefab.gltf`,
        category: 'Lighting'
      },
      {
        name: 'Ambient Light',
        url: `${config.client.fileServer}/projects/default-project/assets/prefabs/ambient-light.prefab.gltf`,
        category: 'Lighting'
      },
      {
        name: 'Hemisphere Light',
        url: `${config.client.fileServer}/projects/default-project/assets/prefabs/hemisphere-light.prefab.gltf`,
        category: 'Lighting'
      },
      {
        name: 'Box Collider',
        url: `${config.client.fileServer}/projects/default-project/assets/prefabs/box-collider.prefab.gltf`,
        category: 'Collider',
        detail: 'Simple box collider'
      },
      {
        name: 'Sphere Collider',
        url: `${config.client.fileServer}/projects/default-project/assets/prefabs/sphere-collider.prefab.gltf`,
        category: 'Collider',
        detail: 'Simple sphere collider'
      },
      {
        name: 'Cylinder Collider',
        url: `${config.client.fileServer}/projects/default-project/assets/prefabs/cylinder-collider.prefab.gltf`,
        category: 'Collider',
        detail: 'Simple cylinder collider'
      },
      {
        name: 'Mesh Collider',
        url: `${config.client.fileServer}/projects/default-project/assets/prefabs/mesh-collider.prefab.gltf`,
        category: 'Collider',
        detail: 'Simple mesh collider, drag and drop your mesh'
      },
      {
        name: 'Text',
        url: `${config.client.fileServer}/projects/default-project/assets/prefabs/text.prefab.gltf`,
        category: 'Text'
      },
      {
        name: 'Title',
        url: `${config.client.fileServer}/projects/default-project/assets/prefabs/title.prefab.gltf`,
        category: 'Text'
      },
      {
        name: 'Body',
        url: `${config.client.fileServer}/projects/default-project/assets/prefabs/body.prefab.gltf`,
        category: 'Text'
      },
      {
        name: 'Image',
        url: `${config.client.fileServer}/projects/default-project/assets/prefabs/image.prefab.gltf`,
        category: 'Image'
      },
      {
        name: 'Video',
        url: `${config.client.fileServer}/projects/default-project/assets/prefabs/video.prefab.gltf`,
        category: 'Video'
      },
      {
        name: 'Skybox',
        url: `${config.client.fileServer}/projects/default-project/assets/prefabs/skybox.prefab.gltf`,
        category: 'Lookdev'
      },
      {
        name: 'Postprocessing',
        url: `${config.client.fileServer}/projects/default-project/assets/prefabs/postprocessing.prefab.gltf`,
        category: 'Lookdev'
      },
      {
        name: 'Fog',
        url: `${config.client.fileServer}/projects/default-project/assets/prefabs/fog.prefab.gltf`,
        category: 'Lookdev'
      },
      {
        name: 'Camera',
        url: `${config.client.fileServer}/projects/default-project/assets/prefabs/camera.prefab.gltf`,
        category: 'Camera'
      }
    ] as PrefabShelfItem[]
})
