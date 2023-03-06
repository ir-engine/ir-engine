import { useEffect } from 'react'
import { Material, Mesh } from 'three'

import { getState, useHookstate } from '@etherealengine/hyperflux'

import { World } from '../ecs/classes/World'
import { Object3DWithEntity, startGroupQueryReactor } from '../scene/components/GroupComponent'
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

const addShaderToObject = (object: Object3DWithEntity) => {
  const obj = object as any as Mesh<any, Material & ScenePlacementMaterialType>
  if (obj.material) {
    if (!obj.material.userData) obj.material.userData = {}
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
}

const removeShaderFromObject = (object: Object3DWithEntity) => {
  const obj = object as any as Mesh<any, Material & ScenePlacementMaterialType>
  if (obj.material) {
    const userData = obj.material.userData
    if (userData?.ScenePlacement) {
      obj.material.transparent = userData.ScenePlacement.previouslyTransparent
      obj.material.opacity = userData.ScenePlacement.previousOpacity
      delete userData.ScenePlacement
    }
  }
}

/**
 * Updates materials with scene object placement opacity shader
 * @param world
 * @returns
 */
export default async function XRScenePlacementShader(world: World) {
  const xrState = getState(XRState)

  const xrScenePlacementReactor = startGroupQueryReactor(
    function XRScenePLacementReactor({ obj }) {
      const scenePlacementMode = useHookstate(xrState.scenePlacementMode)
      const sessionActive = useHookstate(xrState.sessionActive)

      useEffect(() => {
        const useShader = xrState.sessionActive.value && xrState.scenePlacementMode.value === 'placing'
        if (useShader) {
          obj.traverse(addShaderToObject)
        } else {
          obj.traverse(removeShaderFromObject)
        }
      }, [scenePlacementMode, sessionActive])

      useEffect(() => {
        return () => {
          obj.traverse(removeShaderFromObject)
        }
      }, [])

      return null
    },
    [VisibleComponent]
  )

  const execute = () => {}

  const cleanup = async () => {
    xrScenePlacementReactor.stop()
  }

  return { execute, cleanup }
}
