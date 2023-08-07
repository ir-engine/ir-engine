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

import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { AssetType } from '@etherealengine/engine/src/assets/enum/AssetType'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import {
  getComponent,
  getMutableComponent,
  hasComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { iterateEntityNode } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { LoadState, PrefabComponent } from '@etherealengine/engine/src/scene/components/PrefabComponent'

import { removeEntity } from '../../../ecs/functions/EntityFunctions'

export const unloadPrefab = (entity: Entity) => {
  if (!hasComponent(entity, PrefabComponent)) {
    console.warn('no Prefab component')
  } else {
    const prefabComponent = getComponent(entity, PrefabComponent)
    if (prefabComponent.loaded !== LoadState.LOADED) {
      console.warn('prefab', prefabComponent, 'is not in loaded state')
    }
    prefabComponent.roots.map((node) => {
      if (node) {
        const children: Entity[] = []
        iterateEntityNode(node, (child, idx) => {
          children.push(child)
        })
        children.forEach((child) => {
          removeEntity(child)
        })
      }
    })
    if (hasComponent(entity, PrefabComponent)) {
      const prefab = getMutableComponent(entity, PrefabComponent)
      prefab.loaded.set(LoadState.UNLOADED)
      prefab.roots.set([])
    }
  }
}

export const loadPrefab = async (entity: Entity, loader = AssetLoader) => {
  const prefab = getComponent(entity, PrefabComponent)
  const prefabState = getMutableComponent(entity, PrefabComponent)
  //check if asset is already loading or loaded
  if (prefab.loaded !== LoadState.UNLOADED) {
    console.warn('Asset', prefab, 'is not unloaded')
    return
  }
  if (loader.getAssetType(prefab.src) !== AssetType.XRE) {
    throw Error('only .xre.gltf files currently supported')
  }
  try {
    prefabState.loaded.set(LoadState.LOADING)
    const result = (await loader.loadAsync(prefab.src, {
      assetRoot: entity
    })) as Entity[]
    prefabState.roots.set(result)
    prefabState.loaded.set(LoadState.LOADED)
  } catch (e) {
    prefabState.loaded.set(LoadState.UNLOADED)
    throw e
  }
}
