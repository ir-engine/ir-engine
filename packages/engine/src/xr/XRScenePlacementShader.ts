import { Not } from 'bitecs'
import { useEffect } from 'react'
import { Material, Mesh } from 'three'

import { getState, useHookstate } from '@xrengine/hyperflux'

import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import { getComponent, hasComponent } from '../ecs/functions/ComponentFunctions'
import { startQueryReactor } from '../ecs/functions/SystemFunctions'
import { GroupComponent } from '../scene/components/GroupComponent'
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

const addShaderToObject = (entity: Entity) => {
  /** always check if the component exists, since this is potentially scheduled across multiple frames */
  if (!hasComponent(entity, GroupComponent)) return
  for (const object of getComponent(entity, GroupComponent))
    object.traverse((obj: Mesh<any, Material & ScenePlacementMaterialType>) => {
      if (obj.material) {
        const userData = obj.material.userData
        if (!userData.ScenePlacement) {
          userData.ScenePlacement = {
            previouslyTransparent: obj.material.transparent,
            previousOpacity: obj.material.opacity
          }
        }
        obj.material.transparent = true
        obj.material.opacity = 0.4
      }
    })
}

const removeShaderFromObject = (entity: Entity) => {
  if (!hasComponent(entity, GroupComponent)) return
  for (const object of getComponent(entity, GroupComponent))
    object.traverse((obj: Mesh<any, Material & ScenePlacementMaterialType>) => {
      if (obj.material) {
        const userData = obj.material.userData
        if (userData?.ScenePlacement) {
          obj.material.transparent = userData.ScenePlacement.previouslyTransparent
          obj.material.opacity = userData.ScenePlacement.previousOpacity
          delete userData.ScenePlacement
        }
      }
    })
}

/**
 * Updates materials with scene object placement opacity shader
 * @param world
 * @returns
 */
export default async function XRScenePlacementShader(world: World) {
  const xrState = getState(XRState)

  startQueryReactor([GroupComponent, Not(SceneTagComponent), VisibleComponent], function (props) {
    const entity = props.root.entity
    if (!hasComponent(entity, GroupComponent)) throw props.root.stop()

    const scenePlacementMode = useHookstate(xrState.scenePlacementMode)
    const sessionActive = useHookstate(xrState.sessionActive)

    useEffect(() => {
      const useShader = xrState.sessionActive.value && xrState.scenePlacementMode.value
      if (useShader) {
        addShaderToObject(entity)
      } else {
        removeShaderFromObject(entity)
      }
    }, [scenePlacementMode, sessionActive])

    return null
  })

  return { execute: () => {}, cleanup: async () => {} }
}
