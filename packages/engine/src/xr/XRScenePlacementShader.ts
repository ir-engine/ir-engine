import { Not } from 'bitecs'
import { Material, Mesh } from 'three'

import { getState } from '@xrengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import { defineQuery, getComponent, removeQuery } from '../ecs/functions/ComponentFunctions'
import { GroupComponent } from '../scene/components/GroupComponent'
import { SceneObjectComponent } from '../scene/components/SceneObjectComponent'
import { SceneTagComponent } from '../scene/components/SceneTagComponent'
import { VisibleComponent } from '../scene/components/VisibleComponent'
import { XRState } from './XRState'

type ScenePlacementMaterialType = {
  userData: {
    ScenePlacement?: {
      previouslyTransparent: boolean
      previousOpacity: number
    }
  }
}

/**
 * Updates materials with scene object placement opacity shader
 * @param world
 * @returns
 */
export default async function XRScenePlacementShader(world: World) {
  // const sceneQuery = defineQuery([GroupComponent, SceneObjectComponent, Not(SceneTagComponent), VisibleComponent])
  const xrState = getState(XRState)

  const execute = () => {
    const useShader =
      xrState.sessionActive.value && xrState.sessionMode.value === 'immersive-ar' && xrState.scenePlacementMode.value
    // for (const entity of sceneQuery()) {
    //   for (const obj of getComponent(entity, GroupComponent)) {
    world.scene.traverse((obj: Mesh<any, Material & ScenePlacementMaterialType>) => {
      if (obj.material) {
        const userData = obj.material.userData
        if (useShader) {
          if (!userData.ScenePlacement) {
            userData.ScenePlacement = {
              previouslyTransparent: obj.material.transparent,
              previousOpacity: obj.material.opacity
            }
          }
          obj.material.transparent = true
          obj.material.opacity = 0.4
          //add an extra check to prevent reading properties of undefined errors
          //not sure of the root cause of userdata being undefined
        } else if (userData && userData.ScenePlacement) {
          obj.material.transparent = userData.ScenePlacement.previouslyTransparent
          obj.material.opacity = userData.ScenePlacement.previousOpacity
          delete userData.ScenePlacement
        }
      }
    })
    //   }
    // }
  }

  const cleanup = async () => {
    // removeQuery(world, sceneQuery)
  }

  return { execute, cleanup }
}
