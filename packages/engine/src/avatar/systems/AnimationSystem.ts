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

import { VRM } from '@pixiv/three-vrm'
import { EngineState } from '../../ecs/classes/EngineState'
import {
  defineQuery,
  getComponent,
  getOptionalMutableComponent,
  hasComponent
} from '../../ecs/functions/ComponentFunctions'
import { traverseEntityNode } from '../../ecs/functions/EntityTree'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { MeshComponent } from '../../scene/components/MeshComponent'
import { ModelComponent } from '../../scene/components/ModelComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { LocalTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { TweenComponent } from '../../transform/components/TweenComponent'
import { AnimationComponent } from '.././components/AnimationComponent'
import { LoopAnimationComponent } from '../components/LoopAnimationComponent'

const tweenQuery = defineQuery([TweenComponent])
const animationQuery = defineQuery([AnimationComponent, VisibleComponent])
const loopAnimationQuery = defineQuery([AnimationComponent, LoopAnimationComponent, ModelComponent, TransformComponent])

const execute = () => {
  const { deltaSeconds } = getState(EngineState)

  for (const entity of tweenQuery()) {
    const tween = getComponent(entity, TweenComponent)
    tween.update()
  }

  for (const entity of animationQuery()) {
    const animationComponent = getComponent(entity, AnimationComponent)
    const modifiedDelta = deltaSeconds
    animationComponent.mixer.update(modifiedDelta)
    /** Animation tracks manipulate euler data in Object3D.rotation, we need to manually transcribe that to our LocalTransfromComponent quaternion rotation */
    if (hasComponent(entity, ModelComponent))
      traverseEntityNode(entity, (childEntity) => {
        const mesh = getComponent(childEntity, MeshComponent)
        if (!mesh) return
        const euler = mesh.rotation
        const rotation = getComponent(childEntity, LocalTransformComponent).rotation
        rotation.setFromEuler(euler, false)
      })
    const animationActionComponent = getOptionalMutableComponent(entity, LoopAnimationComponent)
    animationActionComponent?._action.value &&
      animationActionComponent?.time.set(animationActionComponent._action.value.time)
  }

  for (const entity of loopAnimationQuery()) {
    const model = getComponent(entity, ModelComponent)
    if (model.asset instanceof VRM) {
      const position = getComponent(entity, TransformComponent).position
      model.asset.update(deltaSeconds)
      getComponent(entity, TransformComponent).position.copy(position)
    }
  }
}

export const AnimationSystem = defineSystem({
  uuid: 'ee.engine.AnimationSystem',
  execute
})
