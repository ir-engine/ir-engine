import { Not } from 'bitecs'
import { Quaternion, Vector3 } from 'three'

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
import { AudioElementNode, AudioElementNodes } from './AudioSystem'

/**
 * https://discourse.threejs.org/t/positionalaudio-setmediastreamsource-with-webrtc-question-not-hearing-any-sound/14301/14
 * https://bugs.chromium.org/p/chromium/issues/detail?id=933677
 */
const SHOULD_CREATE_SILENT_AUDIO_ELS = typeof navigator !== 'undefined' && /chrome/i.test(navigator.userAgent)
function createSilentAudioEl(streamsLive: MediaProvider) {
  if (SHOULD_CREATE_SILENT_AUDIO_ELS) return null!
  let audioEl = new Audio()
  audioEl.setAttribute('autoplay', 'autoplay')
  audioEl.setAttribute('playsinline', 'playsinline')
  audioEl.srcObject = streamsLive
  // we don't actually want to hear audio from this element
  audioEl.volume = 0
  audioEl.muted = true
  // remove reference to be GC'd once audio is flowing
  audioEl.addEventListener('canplaythrough', () => {
    audioEl = null!
  })
}

export const addPannerNode = (audioObject: AudioElementNode, opts = Engine.instance.spatialAudioSettings) => {
  const panner = Engine.instance.audioContext.createPanner()
  audioObject.source.disconnect(audioObject.gain)
  audioObject.source.connect(panner)
  panner.connect(audioObject.gain)
  audioObject.panner = panner

  panner.refDistance = opts.refDistance
  panner.rolloffFactor = opts.rolloffFactor
  panner.maxDistance = opts.maxDistance
  panner.distanceModel = opts.distanceModel

  panner.coneInnerAngle = opts.coneInnerAngle
  panner.coneOuterAngle = opts.coneOuterAngle
  panner.coneOuterGain = opts.coneOuterGain

  return panner
}

export const removePannerNode = (audioObject: AudioElementNode) => {
  audioObject.source.connect(audioObject.gain)
  audioObject.source.disconnect(audioObject.panner!)
  audioObject.panner!.disconnect(audioObject.gain)
  audioObject.panner = undefined
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
  const updateAudioPanner = (panner: PannerNode, position: Vector3, rotation: Quaternion, endTime: number) => {
    _rot.set(0, 0, 1).applyQuaternion(rotation)
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

  /**
   * Avatars
   */
  const networkedAvatarAudioQuery = defineQuery([AvatarComponent, NetworkObjectComponent, Not(LocalAvatarTagComponent)])

  /** Weak map entry is automatically GC'd when network object is removed */
  const avatarAudioObjs: WeakMap<NetworkObjectComponentType, MediaStream> = new WeakMap()

  return () => {
    const audioContext = Engine.instance.audioContext
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
      const audioObject = AudioElementNodes.get(el)!
      addPannerNode(audioObject)
    }

    for (const entity of positionalAudioSceneObjectQuery.exit()) {
      const el = getComponent(entity, MediaComponent).el
      const audioObject = AudioElementNodes.get(el)!
      removePannerNode(audioObject)
    }

    /**
     * No need to update pose of positional audio objects if the audio context is not running
     */
    if (audioContext.state !== 'running') return

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

      // get existing stream - need to wait for UserWindowMedia to populate
      const existingAudioObject = document.getElementById(`${peerId}_audio`)! as HTMLAudioElement
      if (!existingAudioObject) continue

      // mute existing stream
      existingAudioObject.muted = true

      // audio streams exists but has not been handled
      const mediaTrack = consumer.track as MediaStreamTrack
      const stream = new MediaStream([mediaTrack.clone()])

      createSilentAudioEl(stream)

      const audioObject = createAudioNode(stream, audioContext.createMediaStreamSource(stream))

      addPannerNode(audioObject)

      avatarAudioObjs.set(networkObject, stream)
    }

    const endTime = Engine.instance.audioContext.currentTime + world.deltaSeconds

    /**
     * Update panner nodes
     */
    for (const entity of positionalAudioSceneObjectQuery()) {
      const mediaComponent = getComponent(entity, MediaComponent)
      if (mediaComponent && !mediaComponent.playing) continue

      const { position, rotation } = getComponent(entity, TransformComponent)
      const audioObject = AudioElementNodes.get(mediaComponent.el)!

      updateAudioPanner(audioObject.panner!, position, rotation, endTime)
    }

    /** @todo, only apply this to closest 8 (configurable) avatars */

    for (const entity of networkedAvatarAudioEntities) {
      const networkObject = getComponent(entity, NetworkObjectComponent)

      const audioObj = avatarAudioObjs.get(networkObject)!
      if (!audioObj) continue

      const panner = AudioElementNodes.get(audioObj)?.panner!
      if (!panner) continue

      getAvatarBoneWorldPosition(entity, 'Head', _vec3)
      const { rotation } = getComponent(entity, TransformComponent)

      updateAudioPanner(panner, _vec3, rotation, endTime)
    }

    /**
     * Update camera listener position
     */
    const { position, rotation } = getComponent(Engine.instance.currentWorld.cameraEntity, TransformComponent)
    _rot.set(0, 0, -1).applyQuaternion(rotation)
    audioContext.listener.positionX.linearRampToValueAtTime(position.x, endTime)
    audioContext.listener.positionY.linearRampToValueAtTime(position.y, endTime)
    audioContext.listener.positionZ.linearRampToValueAtTime(position.z, endTime)
    audioContext.listener.forwardX.linearRampToValueAtTime(_rot.x, endTime)
    audioContext.listener.forwardY.linearRampToValueAtTime(_rot.y, endTime)
    audioContext.listener.forwardZ.linearRampToValueAtTime(_rot.z, endTime)

    /** @todo support different world ups */
    // audioContext.listener.upX.linearRampToValueAtTime(camera.up.x, endTime)
    // audioContext.listener.upY.linearRampToValueAtTime(camera.up.y, endTime)
    // audioContext.listener.upZ.linearRampToValueAtTime(camera.up.z, endTime)
  }
}
