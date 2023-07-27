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

import { AnimationManager } from '../../../../../avatar/AnimationManager'
import { LoopAnimationComponent } from '../../../../../avatar/components/LoopAnimationComponent'
import { Entity } from '../../../../../ecs/classes/Entity'
import { setComponent } from '../../../../../ecs/functions/ComponentFunctions'
import { MediaComponent } from '../../../../../scene/components/MediaComponent'
import { TransformComponent } from '../../../../../transform/components/TransformComponent'
import { NodeCategory, makeFlowNodeDefinition, makeFunctionNodeDefinition } from '../../../Nodes/NodeDefinitions'
import { eulerToQuat } from '../../Scene/Values/Internal/Vec4'
import { toQuat, toVector3 } from '../../Scene/buildScene'

export const teleportEntity = makeFlowNodeDefinition({
  typeName: 'engine/teleportEntity',
  category: NodeCategory.Action,
  label: 'Teleport Entity',
  in: {
    flow: 'flow',
    entity: 'entity',
    targetPosition: 'vec3',
    targetRotation: 'vec3'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
    const position = toVector3(read('targetPosition'))

    const rotation = toQuat(eulerToQuat(read('targetRotation')))
    const entity = Number(read('entity')) as Entity
    setComponent(entity, TransformComponent, { position: position, rotation: rotation })
    commit('flow')
  }
})

export const playVideo = makeFlowNodeDefinition({
  typeName: 'engine/playVideo',
  category: NodeCategory.Action,
  label: 'Play video',
  in: {
    flow: 'flow',
    entity: 'entity',
    mediaPath: 'string'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
    const media = read('mediaPath')
    const entity = Number(read('entity')) as Entity
    setComponent(entity, MediaComponent, {}) // play
    commit('flow')
  }
})

export const playAudio = makeFlowNodeDefinition({
  typeName: 'engine/playAudio',
  category: NodeCategory.Action,
  label: 'Play audio',
  in: {
    flow: 'flow',
    entity: 'entity',
    mediaPath: 'string'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
    const media = read('mediaPath')
    const entity = Number(read('entity')) as Entity
    setComponent(entity, MediaComponent, {}) // play
    commit('flow')
  }
})

export const getAvatarAnimations = makeFunctionNodeDefinition({
  typeName: 'engine/getAvatarAnimations',
  category: NodeCategory.Query,
  label: 'Get Avatar Animations',
  in: {
    animationName: (_, graphApi) => {
      return {
        valueType: 'string',
        choices: Array.from(AnimationManager.instance._animations)
          .map((clip) => clip.name)
          .sort()
      }
    }
  },
  out: { animationName: 'string' },
  exec: ({ read, write, graph }) => {
    const animationName: string = read('animationName')
    write('animationName', animationName)
  }
})

export const playGltfAnimation = makeFlowNodeDefinition({
  typeName: 'engine/playGltfAnimation',
  category: NodeCategory.Action,
  label: 'Play gltf animation',
  in: {
    flow: 'flow',
    entity: 'entity',
    animationName: 'string',
    isAvatar: 'boolean'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
    const animation: string = read('animationName')
    const animations = AnimationManager.instance._animations
    const isAvatar: boolean = read('isAvatar')
    const entity = Number(read('entity')) as Entity
    const animIndex: number = animations.findIndex((clip) => clip.name === animation)
    setComponent(entity, LoopAnimationComponent, { activeClipIndex: animIndex, hasAvatarAnimations: isAvatar })
    commit('flow')
  }
})
