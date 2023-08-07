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

import React, { useEffect } from 'react'
import { Material, Mesh } from 'three'

import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { defineSystem } from '../ecs/functions/SystemFunctions'
import { GroupQueryReactor, Object3DWithEntity } from '../scene/components/GroupComponent'
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

function XRScenePLacementReactor({ obj }) {
  const xrState = getMutableState(XRState)
  const scenePlacementMode = useHookstate(xrState.scenePlacementMode)
  const sessionActive = useHookstate(xrState.sessionActive)

  useEffect(() => {
    const useShader = xrState.sessionActive.value && xrState.scenePlacementMode.value === 'placing'
    if (useShader) {
      obj.traverse(addShaderToObject)
      return () => {
        obj.traverse(removeShaderFromObject)
      }
    }
  }, [scenePlacementMode, sessionActive])

  return null
}

const reactor = () => {
  return <GroupQueryReactor GroupChildReactor={XRScenePLacementReactor} Components={[VisibleComponent]} />
}

export const XRScenePlacementShaderSystem = defineSystem({
  uuid: 'ee.engine.XRScenePlacementShaderSystem',
  execute: () => {},
  reactor
})
