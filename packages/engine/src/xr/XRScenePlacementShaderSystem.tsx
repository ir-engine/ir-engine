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

import { PluginObjectType, addOBCPlugin } from '../common/functions/OnBeforeCompilePlugin'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { GroupQueryReactor, Object3DWithEntity } from '../scene/components/GroupComponent'
import { SceneObjectComponent } from '../scene/components/SceneObjectComponent'
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

const ShaderID = 'ee.engine.XRScenePlacementShaderSystem.shaderPlugin'

const XRScenePlacementShaderPlugin = {
  id: ShaderID,
  compile: (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <clipping_planes_pars_fragment>',
      'uniform float scenePlacementOpacity;'
    )
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <output_fragment>',
      `#include <output_fragment>
      gl_FragColor.a *= scenePlacementOpacity;`
    )
    shader.uniforms.scenePlacementOpacity = { value: 0.4 }
  }
} as PluginObjectType

const addShaderToObject = (object: Object3DWithEntity) => {
  const obj = object as any as Mesh<any, Material & ScenePlacementMaterialType>
  if (obj.material) {
    if (!obj.material.userData) obj.material.userData = {}
    const userData = obj.material.userData
    if (!userData[ShaderID]) {
      userData[ShaderID] = XRScenePlacementShaderPlugin
      addOBCPlugin(obj.material, userData[ShaderID])
    }
  }
}

const removeShaderFromObject = (object: Object3DWithEntity) => {
  const obj = object as any as Mesh<any, Material & ScenePlacementMaterialType>
  if (obj.material) {
    const userData = obj.material.userData
    if (userData?.[ShaderID] && obj.material.shader?.uniforms?.scenePlacementOpacity) {
      obj.material.shader.uniforms.scenePlacementOpacity.value = 1
      obj.material.needsUpdate = true
      const key = Math.random()
      obj.material.customProgramCacheKey = () => key.toString()
      // removeOBCPlugin(obj.material, userData[ShaderID])
      // delete userData[ShaderID]
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
  return (
    <GroupQueryReactor
      GroupChildReactor={XRScenePLacementReactor}
      Components={[VisibleComponent, SceneObjectComponent]}
    />
  )
}

export const XRScenePlacementShaderSystem = defineSystem({
  uuid: 'ee.engine.XRScenePlacementShaderSystem',
  execute: () => {},
  reactor
})
