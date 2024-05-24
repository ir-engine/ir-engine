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

export const PrefabShelfItem = defineState({
  name: 'ee.editor.PrefabShelfItem',
  initial: () => {
    return {
      //hardcode to test replace with parseStorageProviderURLs
      'Empty Prefab': 'empty',
      '3D Model Prefab': `${config.client.fileServer}/projects/default-project/assets/prefabs/3d-model.prefab.gltf`,
      'Point Light Prefab': `${config.client.fileServer}/projects/default-project/assets/prefabs/point-light.prefab.gltf`,
      'Spot Light Prefab': `${config.client.fileServer}/projects/default-project/assets/prefabs/spot-light.prefab.gltf`,
      'Directional Light Prefab': `${config.client.fileServer}/projects/default-project/assets/prefabs/directional-light.prefab.gltf`,
      'Ambient Light Prefab': `${config.client.fileServer}/projects/default-project/assets/prefabs/ambient-light.prefab.gltf`,
      'Hemisphere Light Prefab': `${config.client.fileServer}/projects/default-project/assets/prefabs/hemisphere-light.prefab.gltf`,
      'Box Collider Prefab': `${config.client.fileServer}/projects/default-project/assets/prefabs/box-collider.prefab.gltf`,
      'Sphere Collider Prefab': `${config.client.fileServer}/projects/default-project/assets/prefabs/sphere-collider.prefab.gltf`,
      'Cylinder Collider Prefab': `${config.client.fileServer}/projects/default-project/assets/prefabs/cylinder-collider.prefab.gltf`,
      'Mesh Collider Prefab': `${config.client.fileServer}/projects/default-project/assets/prefabs/mesh-collider.prefab.gltf`,
      'Text Prefab': `${config.client.fileServer}/projects/default-project/assets/prefabs/text.prefab.gltf`,
      'Skybox Prefab': `${config.client.fileServer}/projects/default-project/assets/prefabs/skybox.prefab.gltf`,
      'Postprocessing Prefab': `${config.client.fileServer}/projects/default-project/assets/prefabs/postprocessing.prefab.gltf`,
      'Fog Prefab': `${config.client.fileServer}/projects/default-project/assets/prefabs/fog.prefab.gltf`
      //will continue to add more prefabs
    } as Record<string, string>
  }
})

export const PrefabShelfCategoriese = defineState({
  name: 'ee.editor.PrefabShelfCategoriese',
  initial: () => {
    return {
      Geo: ['3D Model Prefab'],
      Lighting: [
        'Point Light Prefab',
        'Spot Light Prefab',
        'Directional Light Prefab',
        'Ambient Light Prefab',
        'Hemisphere Light Prefab'
      ],
      Collider: ['Box Collider Prefab', 'Sphere Collider Prefab', 'Cylinder Collider Prefab', 'Mesh Collider Prefab'],
      Text: ['Text Prefab'],
      Lookdev: ['Skybox Prefab', 'Postprocessing Prefab', 'Fog Prefab'],
      Empty: ['Empty Prefab']
      //will continue to add more prefabs
    } as Record<string, string[]>
  }
})
