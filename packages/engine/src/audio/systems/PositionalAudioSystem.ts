import { Not } from 'bitecs'
import { useEffect } from 'react'
import { Quaternion, Vector3 } from 'three'

import {
  createActionQueue,
  getMutableState,
  getState,
  removeActionQueue,
  useHookstate
} from '@etherealengine/hyperflux'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { getAvatarBoneWorldPosition } from '../../avatar/functions/avatarFunctions'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import {
  ComponentType,
  defineQuery,
  getComponent,
  hasComponent,
  removeQuery,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { startQueryReactor } from '../../ecs/functions/SystemFunctions'
import { LocalAvatarTagComponent } from '../../input/components/LocalAvatarTagComponent'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { shouldUseImmersiveMedia } from '../../networking/MediaSettingsState'
import {
  AudioNodeGroup,
  AudioNodeGroups,
  createAudioNodeGroup,
  MediaElementComponent
} from '../../scene/components/MediaComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AudioSettingAction, AudioState } from '../AudioState'
import { PositionalAudioComponent, PositionalAudioInterface } from '../components/PositionalAudioComponent'
import { getMediaSceneMetadataState } from './MediaSystem'

export const addPannerNode = (audioNodes: AudioNodeGroup, opts: PositionalAudioInterface) => {
  const panner = getState(AudioState).audioContext.createPanner()
  panner.refDistance = opts.refDistance
  panner.rolloffFactor = opts.rolloffFactor
  panner.maxDistance = opts.maxDistance
  panner.distanceModel = opts.distanceModel
  panner.coneInnerAngle = opts.coneInnerAngle
  panner.coneOuterAngle = opts.coneOuterAngle
  panner.coneOuterGain = opts.coneOuterGain

  audioNodes.source.disconnect()
  audioNodes.source.connect(panner)
  panner.connect(audioNodes.gain)
  audioNodes.panner = panner

  return panner
}

const _rot = new Vector3()

const updateAudioPanner = (
  panner: PannerNode,
  position: Vector3,
  rotation: Quaternion,
  endTime: number,
  settings: PositionalAudioInterface
) => {
  if (isNaN(position.x)) return
  _rot.set(0, 0, 1).applyQuaternion(rotation)
  if (isNaN(_rot.x)) return
  panner.positionX.linearRampToValueAtTime(position.x, endTime)
  panner.positionY.linearRampToValueAtTime(position.y, endTime)
  panner.positionZ.linearRampToValueAtTime(position.z, endTime)
  panner.orientationX.linearRampToValueAtTime(_rot.x, endTime)
  panner.orientationY.linearRampToValueAtTime(_rot.y, endTime)
  panner.orientationZ.linearRampToValueAtTime(_rot.z, endTime)
  panner.refDistance = settings.refDistance
  panner.rolloffFactor = settings.rolloffFactor
  panner.maxDistance = settings.maxDistance
  panner.distanceModel = settings.distanceModel
  panner.coneInnerAngle = settings.coneInnerAngle
  panner.coneOuterAngle = settings.coneOuterAngle
  panner.coneOuterGain = settings.coneOuterGain
}

export const removePannerNode = (audioNodes: AudioNodeGroup) => {
  audioNodes.source.disconnect()
  audioNodes.source.connect(audioNodes.gain)
  audioNodes.panner?.disconnect()
  audioNodes.panner = undefined
}

/** System class which provides methods for Positional Audio system. */

export default async function PositionalAudioSystem() {
  const _vec3 = new Vector3()

  /**
   * Scene Objects
   */
  const modifyPropertyActionQueue = createActionQueue(EngineActions.sceneObjectUpdate.matches)

  const positionalAudioQuery = defineQuery([PositionalAudioComponent, MediaElementComponent, TransformComponent])

  /**
   * Avatars
   */
  const networkedAvatarAudioQuery = defineQuery([AvatarComponent, NetworkObjectComponent, Not(LocalAvatarTagComponent)])

  const setMediaStreamVolumeActionQueue = createActionQueue(AudioSettingAction.setMediaStreamVolume.matches)

  /** Weak map entry is automatically GC'd when network object is removed */
  const avatarAudioStreams: WeakMap<ComponentType<typeof NetworkObjectComponent>, MediaStream> = new WeakMap()

  const positionalAudioPannerReactor = startQueryReactor(
    [PositionalAudioComponent, TransformComponent],
    function PositionalAudioPannerReactor(props) {
      const entity = props.root.entity
      const mediaElement = useComponent(entity, MediaElementComponent)
      const positionalAudio = useComponent(entity, PositionalAudioComponent)
      useEffect(() => {
        const audioGroup = AudioNodeGroups.get(mediaElement.element.value)! // is it safe to assume this?
        addPannerNode(audioGroup, positionalAudio.value)
        return () => removePannerNode(audioGroup)
      }, [mediaElement, positionalAudio])
      return null
    }
  )

  const audioState = getState(AudioState)

  const execute = () => {
    const audioContext = audioState.audioContext
    const network = Engine.instance.mediaNetwork
    const immersiveMedia = shouldUseImmersiveMedia()
    const positionalAudioSettings = getMediaSceneMetadataState(Engine.instance.currentScene).value

    /**
     * Scene Objects
     */

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
      const peerID = networkObject.ownerId
      const consumer = network?.consumers.find(
        (c) =>
          c.appData.mediaTag === 'cam-audio' &&
          Array.from(network.peers.values()).find(
            (peer) => c.appData.peerID === peer.peerID && peer.userId === networkObject.ownerId
          )
      )

      // avatar still exists but audio stream does not
      if (!consumer) {
        if (avatarAudioStreams.has(networkObject)) avatarAudioStreams.delete(networkObject)
        continue
      }

      const existingAudioObj = avatarAudioStreams.get(networkObject)

      if (existingAudioObj) {
        // only force positional audio for avatar media streams in XR
        const audioNodes = AudioNodeGroups.get(existingAudioObj)!
        if (audioNodes.panner && !immersiveMedia) removePannerNode(audioNodes)
        else if (!audioNodes.panner && immersiveMedia) addPannerNode(audioNodes, positionalAudioSettings)

        // audio stream exists and has already been handled
        continue
      }

      // get existing stream - need to wait for UserWindowMedia to populate
      const existingAudioObject = document.getElementById(`${peerID}_audio`)! as HTMLAudioElement
      if (!existingAudioObject) continue

      // mute existing stream
      existingAudioObject.muted = true
      // todo, refactor this out of event listener
      existingAudioObject.addEventListener('volumechange', () => {
        audioNodes.gain.gain.setTargetAtTime(existingAudioObject.volume, audioContext.currentTime, 0.01)
      })

      // audio streams exists but has not been handled
      const mediaTrack = consumer.track as MediaStreamTrack
      const stream = new MediaStream([mediaTrack.clone()])

      const audioNodes = createAudioNodeGroup(
        stream,
        audioContext.createMediaStreamSource(stream),
        audioState.gainNodeMixBuses.mediaStreams
      )
      audioNodes.gain.gain.setTargetAtTime(existingAudioObject.volume, audioContext.currentTime, 0.01)

      if (immersiveMedia) addPannerNode(audioNodes, positionalAudioSettings)

      avatarAudioStreams.set(networkObject, stream)
    }

    /**
     * Update avatar volume when the value is changed
     */
    for (const action of setMediaStreamVolumeActionQueue()) {
      for (const entity of networkedAvatarAudioEntities) {
        const networkObject = getComponent(entity, NetworkObjectComponent)
        const audioObj = avatarAudioStreams.get(networkObject)!
        if (!audioObj) continue
        const gain = AudioNodeGroups.get(audioObj)?.gain!
        if (gain) gain.gain.setTargetAtTime(action.value, audioContext.currentTime, 0.01)
      }
    }

    const endTime = audioContext.currentTime + Engine.instance.deltaSeconds

    /**
     * Update panner nodes
     */
    for (const entity of positionalAudioQuery()) {
      const element = getComponent(entity, MediaElementComponent).element
      const { position, rotation } = getComponent(entity, TransformComponent)
      const positionalAudio = getComponent(entity, PositionalAudioComponent)
      const audioObject = AudioNodeGroups.get(element)!
      audioObject.panner && updateAudioPanner(audioObject.panner, position, rotation, endTime, positionalAudio)
    }

    /** @todo, only apply this to closest 8 (configurable) avatars #7261 */

    for (const entity of networkedAvatarAudioEntities) {
      const networkObject = getComponent(entity, NetworkObjectComponent)

      const audioObj = avatarAudioStreams.get(networkObject)!
      if (!audioObj) continue

      const panner = AudioNodeGroups.get(audioObj)?.panner!
      if (!panner) continue

      getAvatarBoneWorldPosition(entity, 'Head', _vec3)
      const { rotation } = getComponent(entity, TransformComponent)

      updateAudioPanner(panner, _vec3, rotation, endTime, positionalAudioSettings)
    }

    /**
     * Update camera listener position
     */
    const { position, rotation } = getComponent(Engine.instance.cameraEntity, TransformComponent)
    if (isNaN(position.x)) return
    _rot.set(0, 0, -1).applyQuaternion(rotation)
    if (isNaN(_rot.x)) return
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

  const cleanup = async () => {
    removeActionQueue(modifyPropertyActionQueue)
    removeQuery(positionalAudioQuery)
    removeQuery(networkedAvatarAudioQuery)
    removeActionQueue(setMediaStreamVolumeActionQueue)
    await positionalAudioPannerReactor.stop()
  }

  return { execute, cleanup }
}
