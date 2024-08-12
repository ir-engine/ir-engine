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

import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@etherealengine/ecs/src/SystemGroups'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { GroupQueryReactor } from '../renderer/components/GroupComponent'
import { MeshComponent } from '../renderer/components/MeshComponent'
import { VisibleComponent } from '../renderer/components/VisibleComponent'
import { XRState } from './XRState'

type ScenePlacementMaterialType = {
  userData: {
    ScenePlacement?: {
      previouslyTransparent: boolean
      previousOpacity: number
    }
  }
}

const addShaderToObject = (obj: Mesh<any, Material & ScenePlacementMaterialType>) => {
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
    obj.material.opacity = 0.3
    obj.material.needsUpdate = true
  }
}

const removeShaderFromObject = (obj: Mesh<any, Material & ScenePlacementMaterialType>) => {
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

function XRScenePlacementReactor({ obj }) {
  const xrState = getMutableState(XRState)
  const scenePlacementMode = useHookstate(xrState.scenePlacementMode).value
  const sessionActive = useHookstate(xrState.sessionActive).value

  useEffect(() => {
    if (scenePlacementMode !== 'placing' || !sessionActive) return

    addShaderToObject(obj)
    return () => {
      removeShaderFromObject(obj)
    }
  }, [scenePlacementMode, sessionActive])

  return null
}

const reactor = () => {
  return (
    <GroupQueryReactor GroupChildReactor={XRScenePlacementReactor} Components={[VisibleComponent, MeshComponent]} />
  )
}

export const XRScenePlacementShaderSystem = defineSystem({
  uuid: 'ee.engine.XRScenePlacementShaderSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
