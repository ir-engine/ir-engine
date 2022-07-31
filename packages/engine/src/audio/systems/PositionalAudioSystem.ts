import { Not } from 'bitecs'
import { Object3D, PositionalAudio, Quaternion, Vector3 } from 'three'

import { createActionQueue } from '@xrengine/hyperflux'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { getAvatarBoneWorldPosition } from '../../avatar/functions/avatarFunctions'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { LocalAvatarTagComponent } from '../../input/components/LocalAvatarTagComponent'
import { NetworkObjectComponent, NetworkObjectComponentType } from '../../networking/components/NetworkObjectComponent'
import { MediaComponent } from '../../scene/components/MediaComponent'
import { createAudioNode } from '../../scene/functions/loaders/AudioFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AudioComponent } from '../components/AudioComponent'
import { PositionalAudioTagComponent } from '../components/PositionalAudioTagComponent'
import { AudioType } from '../constants/AudioConstants'
import { AudioElementNodes } from './AudioSystem'

/**
 * https://discourse.threejs.org/t/positionalaudio-setmediastreamsource-with-webrtc-question-not-hearing-any-sound/14301/14
 * https://bugs.chromium.org/p/chromium/issues/detail?id=933677
 */
const SHOULD_CREATE_SILENT_AUDIO_ELS = typeof navigator !== 'undefined' && /chrome/i.test(navigator.userAgent)
function createSilentAudioEl(streamsLive: MediaProvider) {
  if (SHOULD_CREATE_SILENT_AUDIO_ELS) return null!
  const audioEl = new Audio()
  audioEl.setAttribute('autoplay', 'autoplay')
  audioEl.setAttribute('playsinline', 'playsinline')
  audioEl.srcObject = streamsLive
  audioEl.volume = 0 // we don't actually want to hear audio from this element
  return audioEl
}

export const updatePositionalAudioTag = (entity: Entity) => {
  const audioComponent = getComponent(entity, AudioComponent)
  if (audioComponent.audioType === AudioType.Stereo && hasComponent(entity, PositionalAudioTagComponent))
    removeComponent(entity, PositionalAudioTagComponent)
  if (audioComponent.audioType === AudioType.Positional && !hasComponent(entity, PositionalAudioTagComponent))
    addComponent(entity, PositionalAudioTagComponent, true)
}

/** System class which provides methods for Positional Audio system. */

export default async function PositionalAudioSystem(world: World) {
  const _rot = new Vector3()
  const updateAudioPanner = (panner: PannerNode, position: Vector3, rotation: Quaternion) => {
    const audioListener = Engine.instance.currentWorld.audioListener
    _rot.set(0, 0, 1).applyQuaternion(rotation)
    const endTime = audioListener.context.currentTime + audioListener.timeDelta
    panner.positionX.linearRampToValueAtTime(position.x, endTime)
    panner.positionY.linearRampToValueAtTime(position.y, endTime)
    panner.positionZ.linearRampToValueAtTime(position.z, endTime)
    panner.orientationX.linearRampToValueAtTime(_rot.x, endTime)
    panner.orientationY.linearRampToValueAtTime(_rot.y, endTime)
    panner.orientationZ.linearRampToValueAtTime(_rot.z, endTime)
  }

  const _vec3 = new Vector3()

  /**
   * Scene Objects
   */
  const modifyPropertyActionQueue = createActionQueue(EngineActions.sceneObjectUpdate.matches)
  const audioQuery = defineQuery([AudioComponent, MediaComponent])
  const positionalAudioSceneObjectQuery = defineQuery([
    AudioComponent,
    MediaComponent,
    PositionalAudioTagComponent,
    TransformComponent
  ])
  const positionalAudioQuery = defineQuery([PositionalAudioTagComponent])

  /**
   * Avatars
   */
  const networkedAvatarAudioQuery = defineQuery([AvatarComponent, NetworkObjectComponent, Not(LocalAvatarTagComponent)])

  /**
   * Weak map entry is automatically GC'd when network object is removed
   */

  const avatarAudioObjs: WeakMap<
    NetworkObjectComponentType,
    {
      stream: any
      bugEl: HTMLAudioElement
    }
  > = new WeakMap()

  return () => {
    const audioListener = Engine.instance.currentWorld.audioListener
    audioListener.updateMatrixWorld(true)
    const network = Engine.instance.currentWorld.mediaNetwork

    /**
     * Scene Objects
     */
    const audioEntities = audioQuery()
    for (const action of modifyPropertyActionQueue()) {
      for (const entity of action.entities) {
        if (audioEntities.includes(entity)) updatePositionalAudioTag(entity)
      }
    }

    for (const entity of positionalAudioSceneObjectQuery.enter()) {
      const el = getComponent(entity, MediaComponent).el
      const panner = audioListener.context.createPanner()
      panner.panningModel = 'HRTF'
      const audioObject = AudioElementNodes.get(el)!
      panner.connect(audioObject.gain)
      audioObject.panner = panner
    }

    for (const entity of positionalAudioSceneObjectQuery.exit()) {
      const el = getComponent(entity, MediaComponent).el
      const audioObject = AudioElementNodes.get(el)!
      audioObject.panner!.disconnect(audioObject.gain)
      audioObject.panner = undefined
    }

    /**
     * No need to update pose of positional audio objects if the audio context is not running
     */
    if (audioListener.context.state !== 'running') return

    /**
     * Avatars
     * lazily detect when consumers are created and destroyed
     */
    const networkedAvatarAudioEntities = networkedAvatarAudioQuery()
    for (const entity of networkedAvatarAudioEntities) {
      const networkObject = getComponent(entity, NetworkObjectComponent)
      const peerId = networkObject.ownerId
      const consumer = network?.consumers.find(
        (c: any) => c.appData.peerId === peerId && c.appData.mediaTag === 'cam-audio'
      )

      // avatar still exists bu audio stream does not
      if (!consumer) {
        if (avatarAudioObjs.has(networkObject)) avatarAudioObjs.delete(networkObject)
        continue
      }

      // audio stream exists and has already been handled
      if (avatarAudioObjs.has(networkObject)) continue

      // audio streams exists but has not been handled
      const mediaTrack = consumer.track as MediaStreamTrack
      const stream = new MediaStream([mediaTrack.clone()])

      // TODO: test that this isn't needed anymore
      const bugEl = createSilentAudioEl(stream)

      const audioStreamSource = audioListener.context.createMediaStreamSource(stream)
      const audioObject = createAudioNode(stream, audioStreamSource)

      const panner = audioListener.context.createPanner()
      panner.panningModel = 'HRTF'
      panner.connect(audioObject.gain)
      panner.refDistance = 20
      panner.distanceModel = 'linear'
      audioObject.panner = panner
      // panner.coneInnerAngle = 180
      // panner.coneOuterAngle = 230
      // panner.coneOuterGain = 0.1

      avatarAudioObjs.set(networkObject, { stream, bugEl: null! })

      const existingAudioObject = document.getElementById(`${peerId}_audio`)! as HTMLAudioElement
      existingAudioObject.volume = 0
    }

    /**
     * Update panner nodes
     */
    for (const entity of positionalAudioSceneObjectQuery()) {
      const mediaComponent = getComponent(entity, MediaComponent)
      if (mediaComponent && !mediaComponent.playing) continue

      const { position, rotation } = getComponent(entity, TransformComponent)
      const audioObject = AudioElementNodes.get(mediaComponent.el)!

      updateAudioPanner(audioObject.panner!, position, rotation)
    }

    /** @todo, only apply this to closest 8 (configurable) avatars */

    for (const entity of networkedAvatarAudioEntities) {
      const networkObject = getComponent(entity, NetworkObjectComponent)

      const audioObj = avatarAudioObjs.get(networkObject)!
      if (!audioObj) continue

      const panner = AudioElementNodes.get(audioObj.stream)?.panner!
      if (!panner) continue

      getAvatarBoneWorldPosition(entity, 'Head', _vec3)
      const { rotation } = getComponent(entity, TransformComponent)

      updateAudioPanner(panner, _vec3, rotation)
    }
  }
}
