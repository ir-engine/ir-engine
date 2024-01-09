import { NodeCategory, makeFlowNodeDefinition } from '@behave-graph/core'
import { Tween } from '@tweenjs/tween.js'
import { Entity } from '../../../../../ecs/classes/Entity'
import { getMutableComponent, setComponent } from '../../../../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../../../../ecs/functions/EntityFunctions'
import { VolumetricComponent } from '../../../../../scene/components/VolumetricComponent'
import { TweenComponent } from '../../../../../transform/components/TweenComponent'

/**
 * playVolumetric: Play / pause volumetric video
 */
export const playVolumetric = makeFlowNodeDefinition({
  typeName: 'engine/playVolumetric',
  category: NodeCategory.Action,
  label: 'Play Volumetric',
  in: {
    flow: 'flow',
    entity: 'entity',
    play: 'boolean'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
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
  typeName: 'engine/setVolumetricTime',
  category: NodeCategory.Action,
  label: 'Set Volumetric Time',
  in: {
    flow: 'flow',
    entity: 'entity',
    time: 'float'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
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
  typeName: 'engine/fadeVolumetricVolume',
  category: NodeCategory.Effect,
  label: 'Fade Volumetric Volume',
  in: {
    flow: 'flow',
    entity: 'entity',
    targetVolume: 'float',
    duration: 'float'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
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
