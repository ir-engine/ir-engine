/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Tween } from '@tweenjs/tween.js'

import { getMutableComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { createEntity, removeEntity } from '@ir-engine/ecs/src/EntityFunctions'
import { VolumetricComponent } from '@ir-engine/engine/src/scene/components/VolumetricComponent'
import { TweenComponent } from '@ir-engine/spatial/src/transform/components/TweenComponent'
import { NodeCategory, makeFlowNodeDefinition } from '@ir-engine/visual-script'

/**
 * playVolumetric: Play / pause volumetric video
 */
export const playVolumetric = makeFlowNodeDefinition({
  typeName: 'engine/media/volumetric/playVolumetric',
  category: NodeCategory.Engine,
  label: 'Play Volumetric',
  in: {
    flow: 'flow',
    entity: 'entity',
    play: 'boolean'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit }) => {
    const entity = read<Entity>('entity')
    const play = read<boolean>('play')
    const volumetricComponent = getMutableComponent(entity, VolumetricComponent)
    volumetricComponent.paused.set(!play)
    commit('flow')
  }
})

/**
 * setVolumetricTime: Set volumetric video time
 */
export const setVolumetricTime = makeFlowNodeDefinition({
  typeName: 'engine/media/volumetric/setVolumetricTime',
  category: NodeCategory.Engine,
  label: 'Set Volumetric Time',
  in: {
    flow: 'flow',
    entity: 'entity',
    time: 'float'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit }) => {
    const entity = read<Entity>('entity')
    const time = read<number>('time')
    const volumetricComponent = getMutableComponent(entity, VolumetricComponent)
    volumetricComponent.currentTrackInfo.currentTime.set(time)
    commit('flow')
  }
})

/**
 * fadeVolumetricVolume: fade in/out volumetric audio volume
 */
export const fadeVolumetricAudioVolume = makeFlowNodeDefinition({
  typeName: 'engine/media/volumetric/fadeVolumetricVolume',
  category: NodeCategory.Engine,
  label: 'Fade Volumetric Volume',
  in: {
    flow: 'flow',
    entity: 'entity',
    targetVolume: 'float',
    duration: 'float'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit }) => {
    const entity = read<Entity>('entity')
    const targetVolume = read<number>('targetVolume')
    const duration = read<number>('duration')

    const volumetricComponent = getMutableComponent(entity, VolumetricComponent)
    const volumeSlider: any = {}

    Object.defineProperty(volumeSlider, 'volume', {
      get: () => volumetricComponent.volume.value,
      set: (value) => {
        volumetricComponent.volume.set(value)
      }
    })
    const tweenEntity = createEntity()
    setComponent(
      tweenEntity,
      TweenComponent,
      new Tween<any>(volumeSlider)
        .to({ volume: targetVolume }, duration * 1000)
        .start()
        .onComplete(() => {
          removeEntity(tweenEntity)
        })
    )
    commit('flow')
  }
})
