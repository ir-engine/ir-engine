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
import config from '@ir-engine/common/src/config'
import { useFile } from '@ir-engine/engine/src/assets/functions/resourceLoaderHooks'
import { defineState, getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'
import React from 'react'

import { IoCubeOutline } from 'react-icons/io5'
import CameraIcon from './icons/camera.svg?react'
import ColliderIcon from './icons/collider.svg?react'
import AddIcon from './icons/empty.svg?react'
import GeoIcon from './icons/geo.svg?react'
import ImageIcon from './icons/image.svg?react'
import LightingIcon from './icons/lighting.svg?react'
import LookDevIcon from './icons/lookdev.svg?react'
import TextIcon from './icons/text.svg?react'
import VideoIcon from './icons/video.svg?react'

export type PrefabShelfItem = {
  name: string
  url: string
  category: string
  detail?: string
  icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
}

export const PrefabIcon = ({ categoryTitle, isSelected }: { categoryTitle: string; isSelected: boolean }) => {
  const color = isSelected ? '#FFFFFF' : '#9CA0AA'
  const icons: Record<string, JSX.Element> = {
    Geo: <GeoIcon stroke={color} />,
    Lighting: <LightingIcon stroke={color} />,
    Collider: <ColliderIcon stroke={color} />,
    Text: <TextIcon stroke={color} />,
    Image: <ImageIcon stroke={color} />,
    Video: <VideoIcon stroke={color} />,
    Lookdev: <LookDevIcon stroke={color} />,
    Camera: <CameraIcon stroke={color} />,
    Empty: <AddIcon stroke={color} />,
    Default: <IoCubeOutline className={`h-5 w-5 text-[${color}]`} />
  }

  const IconElement = getState(PrefabShelfState).find((item) => item.category == categoryTitle)?.icon
  if (IconElement) icons[categoryTitle] = <IconElement stroke={color} /> //include external icons

  return icons[categoryTitle] ?? icons.Default
}

export const PrefabShelfState = defineState({
  name: 'ee.editor.PrefabShelfItem',
  initial: () =>
    [
      {
        name: '3D Model',
        url: `${config.client.fileServer}/projects/ir-engine/default-project/assets/prefabs/3d-model.prefab.gltf`,
        category: 'Geo',
        detail: 'Blank 3D model ready for your own assets'
      },
      {
        name: '3D Model (Variants)',
        url: `${config.client.fileServer}/projects/ir-engine/default-project/assets/prefabs/model-variants.prefab.gltf`,
        category: 'Geo',
        detail: 'A 3D model with multiple variants'
      },
      {
        name: 'Primitive Geometry',
        url: `${config.client.fileServer}/projects/ir-engine/default-project/assets/prefabs/geo.prefab.gltf`,
        category: 'Geo'
      },
      {
        name: 'Ground Plane',
        url: `${config.client.fileServer}/projects/ir-engine/default-project/assets/prefabs/ground-plane.prefab.gltf`,
        category: 'Geo'
      },
      {
        name: 'Point Light',
        url: `${config.client.fileServer}/projects/ir-engine/default-project/assets/prefabs/point-light.prefab.gltf`,
        category: 'Lighting'
      },
      {
        name: 'Spot Light',
        url: `${config.client.fileServer}/projects/ir-engine/default-project/assets/prefabs/spot-light.prefab.gltf`,
        category: 'Lighting'
      },
      {
        name: 'Directional Light',
        url: `${config.client.fileServer}/projects/ir-engine/default-project/assets/prefabs/directional-light.prefab.gltf`,
        category: 'Lighting'
      },
      {
        name: 'Ambient Light',
        url: `${config.client.fileServer}/projects/ir-engine/default-project/assets/prefabs/ambient-light.prefab.gltf`,
        category: 'Lighting'
      },
      {
        name: 'Hemisphere Light',
        url: `${config.client.fileServer}/projects/ir-engine/default-project/assets/prefabs/hemisphere-light.prefab.gltf`,
        category: 'Lighting'
      },
      {
        name: 'Box Collider',
        url: `${config.client.fileServer}/projects/ir-engine/default-project/assets/prefabs/box-collider.prefab.gltf`,
        category: 'Collider',
        detail: 'Simple box collider'
      },
      {
        name: 'Sphere Collider',
        url: `${config.client.fileServer}/projects/ir-engine/default-project/assets/prefabs/sphere-collider.prefab.gltf`,
        category: 'Collider',
        detail: 'Simple sphere collider'
      },
      {
        name: 'Cylinder Collider',
        url: `${config.client.fileServer}/projects/ir-engine/default-project/assets/prefabs/cylinder-collider.prefab.gltf`,
        category: 'Collider',
        detail: 'Simple cylinder collider'
      },
      {
        name: 'Text',
        url: `${config.client.fileServer}/projects/ir-engine/default-project/assets/prefabs/text.prefab.gltf`,
        category: 'Text'
      },
      {
        name: 'Title',
        url: `${config.client.fileServer}/projects/ir-engine/default-project/assets/prefabs/title.prefab.gltf`,
        category: 'Text'
      },
      {
        name: 'Body',
        url: `${config.client.fileServer}/projects/ir-engine/default-project/assets/prefabs/body.prefab.gltf`,
        category: 'Text'
      },
      {
        name: 'Image',
        url: `${config.client.fileServer}/projects/ir-engine/default-project/assets/prefabs/image.prefab.gltf`,
        category: 'Image'
      },
      {
        name: 'Video',
        url: `${config.client.fileServer}/projects/ir-engine/default-project/assets/prefabs/video.prefab.gltf`,
        category: 'Video'
      },
      {
        name: 'Skybox',
        url: `${config.client.fileServer}/projects/ir-engine/default-project/assets/prefabs/skybox.prefab.gltf`,
        category: 'Lookdev'
      },
      {
        name: 'Postprocessing',
        url: `${config.client.fileServer}/projects/ir-engine/default-project/assets/prefabs/postprocessing.prefab.gltf`,
        category: 'Lookdev'
      },
      {
        name: 'Fog',
        url: `${config.client.fileServer}/projects/ir-engine/default-project/assets/prefabs/fog.prefab.gltf`,
        category: 'Lookdev'
      },
      {
        name: 'Camera',
        url: `${config.client.fileServer}/projects/ir-engine/default-project/assets/prefabs/camera.prefab.gltf`,
        category: 'Camera'
      }
    ] as PrefabShelfItem[],
  reactor: () => {
    const shelfState = useHookstate(getMutableState(PrefabShelfState))
    return shelfState.value.map((shelfItem) => <ShelfItemReactor key={shelfItem.url} url={shelfItem.url} />)
  }
})

const ShelfItemReactor = (props: { key: string; url: string }): JSX.Element | null => {
  // Add prefab to cache
  useFile(props.url)
  return null
}
