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

import { getState } from '@etherealengine/hyperflux'
import { Vector3 } from 'three'
import { CameraComponent } from '../../../../../camera/components/CameraComponent'
import { Engine } from '../../../../../ecs/classes/Engine'
import { getComponent } from '../../../../../ecs/functions/ComponentFunctions'
import { MouseButton } from '../../../../../input/state/ButtonState'
import { Physics, RaycastArgs } from '../../../../../physics/classes/Physics'
import { AllCollisionMask, CollisionGroups } from '../../../../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../../../../physics/functions/getInteractionGroups'
import { PhysicsState } from '../../../../../physics/state/PhysicsState'
import { SceneQueryType } from '../../../../../physics/types/PhysicsTypes'
import { EngineRenderer } from '../../../../../renderer/WebGLRendererSystem'
import { Assert } from '../../../Diagnostics/Assert'
import { NodeCategory, makeEventNodeDefinition } from '../../../Nodes/NodeDefinitions'

type State = {
  onSceneClick?: ((event: MouseEvent) => void) | undefined
}

const initialState = (): State => ({})

// very 3D specific.
export const OnSceneClick = makeEventNodeDefinition({
  typeName: 'engine/SceneClick',
  category: NodeCategory.Event,
  label: 'On Button Press',
  in: {},
  out: {
    flow: 'flow',
    hitEntity: 'entity',
    clickType: 'string'
  },
  initialState: initialState(),
  init: ({ read, write, commit, graph }) => {
    const inputRaycast = {
      type: SceneQueryType.Closest,
      origin: new Vector3(),
      direction: new Vector3(),
      maxDistance: 1000,
      groups: getInteractionGroups(CollisionGroups.Default, AllCollisionMask),
      excludeRigidBody: undefined //
    } as RaycastArgs

    const onSceneClick = (event: MouseEvent) => {
      // when click detected, shoot raycast, and get first entity hit
      const down = event.type === 'mousedown' || event.type === 'touchstart'
      let clickType = MouseButton.PrimaryClick
      if (event.button === 1) clickType = MouseButton.AuxiliaryClick
      else if (event.button === 2) clickType = MouseButton.SecondaryClick
      //write('entity',)
      const hits = Physics.castRayFromCamera(
        getComponent(Engine.instance.cameraEntity, CameraComponent),
        Engine.instance.pointerState.position,
        getState(PhysicsState).physicsWorld,
        inputRaycast
      )
      let hitEntity = null
      if (hits.length) {
        const hit = hits[0]
        hitEntity = (hit.body?.userData as any)?.entity as Entity
      }
      write('hitEntity', hitEntity)
      write('clickType', clickType)
      commit('flow')
    }
    const canvas = EngineRenderer.instance.renderer.domElement
    canvas.addEventListener('mouseup', onSceneClick)
    canvas.addEventListener('mousedown', onSceneClick)
    canvas.addEventListener('touchstart', onSceneClick)
    canvas.addEventListener('touchend', onSceneClick)
    // add event listener
    const state: State = {
      onSceneClick
    }

    return state
  },
  dispose: ({ state: { onSceneClick }, graph: { getDependency } }) => {
    Assert.mustBeTrue(onSceneClick !== undefined)

    if (!onSceneClick) return {}

    //remove listener here

    return {}
  }
})
