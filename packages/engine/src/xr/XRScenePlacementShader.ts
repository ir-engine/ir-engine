import { Not } from 'bitecs'
import { useEffect } from 'react'
import { Material, Mesh } from 'three'

import { getState, useHookstate } from '@xrengine/hyperflux'

import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import {
  defineComponent,
  defineQuery,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  removeQuery,
  setComponent
} from '../ecs/functions/ComponentFunctions'
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
        if (userData.ScenePlacement) {
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

  const ScenePlacementShaderReactorComponent = defineComponent({
    name: 'XRE_ScenePlacementShaderReactorComponent',

    reactor: function (props) {
      const entity = props.root.entity
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
    }
  })

  const sceneQuery = defineQuery([GroupComponent, Not(SceneTagComponent), VisibleComponent])

  const execute = () => {
    for (const entity of sceneQuery.enter()) setComponent(entity, ScenePlacementShaderReactorComponent)
    for (const entity of sceneQuery.exit()) removeComponent(entity, ScenePlacementShaderReactorComponent)
  }

  const cleanup = async () => {
    removeQuery(world, sceneQuery)
  }

  return { execute, cleanup }
}
