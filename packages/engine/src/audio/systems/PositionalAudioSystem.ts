import { Audio as AudioObject } from 'three'

import { addActionReceptor } from '@xrengine/hyperflux'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { matches } from '../../common/functions/MatchesUtils'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { addComponent, defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import {
  PositionalAudioSettingsComponent,
  PositionalAudioSettingsComponentType
} from '../../scene/components/AudioSettingsComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import {
  deserializeAudio,
  SCENE_COMPONENT_AUDIO,
  SCENE_COMPONENT_AUDIO_DEFAULT_VALUES,
  updateAudio
} from '../../scene/functions/loaders/AudioFunctions'
import { AudioComponent, AudioComponentType } from '../components/AudioComponent'
import { AudioTagComponent } from '../components/AudioTagComponent'
import { AudioType } from '../constants/AudioConstants'

const SHOULD_CREATE_SILENT_AUDIO_ELS = typeof navigator !== 'undefined' && /chrome/i.test(navigator.userAgent)
function createSilentAudioEl(streamsLive) {
  const audioEl = new Audio()
  audioEl.setAttribute('autoplay', 'autoplay')
  audioEl.setAttribute('playsinline', 'playsinline')
  audioEl.srcObject = streamsLive
  audioEl.volume = 0 // we don't actually want to hear audio from this element
  return audioEl
}

/** System class which provides methods for Positional Audio system. */

export default async function PositionalAudioSystem(world: World) {
  const avatarAudioQuery = defineQuery([AudioTagComponent, AvatarComponent])
  const audioTagQuery = defineQuery([AudioTagComponent])
  const audioQuery = defineQuery([AudioComponent])
  const settingsQuery = defineQuery([PositionalAudioSettingsComponent])

  const avatarAudioStream: Map<Entity, any> = new Map()

  function audioReceptors(action) {
    matches(action)
      .when(EngineActions.startSuspendedContexts.matches, () => {
        console.log('starting suspended audio nodes')
        for (const entity of avatarAudioQuery()) {
          const audio = getComponent(entity, Object3DComponent).value
          const audioEl = audio?.userData.audioEl
          if (audioEl && audioEl.context?.state === 'suspended') audioEl.context.resume()
        }
        if (!Engine.instance.isEditor) {
          for (const entity of audioQuery()) {
            const audio = getComponent(entity, Object3DComponent).value
            const audioEl = audio?.userData.audioEl
            if (audioEl && audioEl.autoplay) audioEl.play()
          }
        }
      })
      .when(EngineActions.suspendPositionalAudio.matches, () => {
        for (const entity of avatarAudioQuery()) {
          const audio = getComponent(entity, Object3DComponent).value
          const audioEl = audio?.userData.audioEl
          if (audioEl && audioEl.context) audioEl.context.suspend()
        }
      })
  }
  addActionReceptor(audioReceptors)

  let positionalAudioSettings: PositionalAudioSettingsComponentType

  const applyMediaAudioSettings = (props: AudioComponentType, setVolume = true): AudioComponentType => {
    props.audioType = positionalAudioSettings.usePositionalAudio ? AudioType.Positional : AudioType.Stereo
    props.distanceModel = positionalAudioSettings.mediaDistanceModel
    props.maxDistance = positionalAudioSettings.mediaMaxDistance
    props.refDistance = positionalAudioSettings.mediaRefDistance
    props.rolloffFactor = positionalAudioSettings.mediaRolloffFactor
    if (setVolume) props.volume = positionalAudioSettings.mediaVolume

    return props
  }

  return () => {
    const network = Engine.instance.currentWorld.mediaNetwork

    for (const entity of settingsQuery.enter()) {
      positionalAudioSettings = getComponent(entity, PositionalAudioSettingsComponent)
    }

    for (const entity of audioTagQuery.exit()) {
      const obj3d = getComponent(entity, Object3DComponent, true)
      if (obj3d && obj3d.value.userData.audioEl?.source) obj3d.value.userData.audioEl.disconnect()
    }

    for (const entity of avatarAudioQuery.enter()) {
      const entityNetworkObject = getComponent(entity, NetworkObjectComponent)
      if (entityNetworkObject) {
        const peerId = entityNetworkObject.ownerId

        const consumer = network?.consumers.find(
          (c: any) => c.appData.peerId === peerId && c.appData.mediaTag === 'cam-audio'
        )
        if (consumer == null && avatarAudioStream.get(entity) != null) {
          avatarAudioStream.delete(entity)
        }
      }

      const props = applyMediaAudioSettings(SCENE_COMPONENT_AUDIO_DEFAULT_VALUES)
      // addComponent(entity, AudioComponent, props)
      // updateAudio(entity, props)
    }

    for (const entity of avatarAudioQuery.exit()) {
      avatarAudioStream.delete(entity)
    }

    for (const entity of avatarAudioQuery()) {
      if (hasComponent(entity, LocalInputTagComponent)) continue

      const entityNetworkObject = getComponent(entity, NetworkObjectComponent)
      let consumer
      if (entityNetworkObject != null) {
        const peerId = entityNetworkObject.ownerId
        consumer = network?.consumers.find(
          (c: any) => c.appData.peerId === peerId && c.appData.mediaTag === 'cam-audio'
        )
      }

      if (!consumer) continue
      if (avatarAudioStream.has(entity) && consumer.id === avatarAudioStream.get(entity).id) continue

      const consumerLive = consumer.track
      avatarAudioStream.set(entity, consumerLive)
      const streamsLive = new MediaStream([consumerLive.clone()])

      if (SHOULD_CREATE_SILENT_AUDIO_ELS) {
        createSilentAudioEl(streamsLive) // TODO: Do the audio els need to get cleaned up?
      }

      const avatarAudio = getComponent(entity, Object3DComponent)?.value

      if (avatarAudio) {
        const audioEl = avatarAudio.userData.audioEl as AudioObject
        if (audioEl) {
          const audioStreamSource = audioEl.context.createMediaStreamSource(streamsLive)
          if (audioEl.context.state === 'suspended') audioEl.context.resume()

          audioEl.setNodeSource(audioStreamSource as unknown as AudioBufferSourceNode)
        }
      }
    }
  }
}
