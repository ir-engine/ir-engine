import { Not } from 'bitecs'
import { Quaternion, Vector3 } from 'three'

import { createActionQueue, dispatchAction, removeActionQueue } from '@xrengine/hyperflux'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { getAvatarBoneWorldPosition } from '../../avatar/functions/avatarFunctions'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, hasComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { LocalAvatarTagComponent } from '../../input/components/LocalAvatarTagComponent'
import { NetworkObjectComponent, NetworkObjectComponentType } from '../../networking/components/NetworkObjectComponent'
import { MediaSettingAction, shouldUseImmersiveMedia } from '../../networking/MediaSettingsState'
import {
  AudioNodeGroup,
  AudioNodeGroups,
  createAudioNodeGroup,
  MediaElementComponent
} from '../../scene/components/MediaComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AudioSettingAction } from '../AudioState'
import { ImmersiveMediaTagComponent, SCENE_COMPONENT_MEDIA_SETTINGS } from '../components/ImmersiveMediaTagComponent'
import { PositionalAudioComponent } from '../components/PositionalAudioComponent'
import {
  PositionalAudioSettingsComponent,
  SCENE_COMPONENT_AUDIO_SETTINGS,
  SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES
} from '../components/PositionalAudioSettingsComponent'

export const addPannerNode = (audioNodes: AudioNodeGroup, opts = Engine.instance.spatialAudioSettings) => {
  const panner = Engine.instance.audioContext.createPanner()
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
  settings = Engine.instance.spatialAudioSettings
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

export const updatePositionalAudioSettings = (entity: Entity) => {
  const settings = getComponent(entity, PositionalAudioSettingsComponent)
  Engine.instance.spatialAudioSettings = { ...settings }
}

/** System class which provides methods for Positional Audio system. */

export default async function PositionalAudioSystem(world: World) {
  const _vec3 = new Vector3()

  const positionalAudioSettingsQuery = defineQuery([PositionalAudioSettingsComponent])

  world.sceneComponentRegistry.set(PositionalAudioSettingsComponent.name, SCENE_COMPONENT_AUDIO_SETTINGS)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_AUDIO_SETTINGS, {
    defaultData: SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES
  })

  world.sceneComponentRegistry.set(ImmersiveMediaTagComponent.name, SCENE_COMPONENT_MEDIA_SETTINGS)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_MEDIA_SETTINGS, {})

  /**
   * Scene Objects
   */
  const modifyPropertyActionQueue = createActionQueue(EngineActions.sceneObjectUpdate.matches)

  const positionalAudioQuery = defineQuery([PositionalAudioComponent, MediaElementComponent, TransformComponent])

  const immersiveMediaQuery = defineQuery([ImmersiveMediaTagComponent])

  /**
   * Avatars
   */
  const networkedAvatarAudioQuery = defineQuery([AvatarComponent, NetworkObjectComponent, Not(LocalAvatarTagComponent)])

  const setMediaStreamVolumeActionQueue = createActionQueue(AudioSettingAction.setMediaStreamVolume.matches)

  /** Weak map entry is automatically GC'd when network object is removed */
  const avatarAudioStreams: WeakMap<NetworkObjectComponentType, MediaStream> = new WeakMap()

  const execute = () => {
    const audioContext = Engine.instance.audioContext
    const network = Engine.instance.currentWorld.mediaNetwork
    const immersiveMedia = shouldUseImmersiveMedia()

    for (const entity of positionalAudioSettingsQuery.enter()) updatePositionalAudioSettings(entity)

    if (immersiveMediaQuery.enter().length) dispatchAction(MediaSettingAction.setUseImmersiveMedia({ use: true }))
    if (immersiveMediaQuery.exit().length) dispatchAction(MediaSettingAction.setUseImmersiveMedia({ use: false }))

    /**
     * Scene Objects
     */
    for (const action of modifyPropertyActionQueue()) {
      for (const entity of action.entities) {
        if (hasComponent(entity, PositionalAudioSettingsComponent)) updatePositionalAudioSettings(entity)
      }
    }

    for (const entity of positionalAudioQuery.enter()) {
      const el = getComponent(entity, MediaElementComponent).element
      const audioGroup = AudioNodeGroups.get(el)
      if (audioGroup) addPannerNode(audioGroup, getComponent(entity, PositionalAudioComponent).value)
    }

    for (const entity of positionalAudioQuery.exit()) {
      const el = getComponent(entity, MediaElementComponent, true).element
      const audioGroup = AudioNodeGroups.get(el)
      if (audioGroup) removePannerNode(audioGroup)
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
        else if (!audioNodes.panner && immersiveMedia) addPannerNode(audioNodes)

        // audio stream exists and has already been handled
        continue
      }

      // get existing stream - need to wait for UserWindowMedia to populate
      const existingAudioObject = document.getElementById(`${peerId}_audio`)! as HTMLAudioElement
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
        Engine.instance.gainNodeMixBuses.mediaStreams
      )
      audioNodes.gain.gain.setTargetAtTime(existingAudioObject.volume, audioContext.currentTime, 0.01)

      if (immersiveMedia) addPannerNode(audioNodes)

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

    const endTime = Engine.instance.audioContext.currentTime + world.deltaSeconds

    /**
     * Update panner nodes
     */
    for (const entity of positionalAudioQuery()) {
      const element = getComponent(entity, MediaElementComponent).element
      const { position, rotation } = getComponent(entity, TransformComponent)
      const positionalAudio = getComponent(entity, PositionalAudioComponent)
      const audioObject = AudioNodeGroups.get(element)!
      audioObject.panner && updateAudioPanner(audioObject.panner, position, rotation, endTime, positionalAudio.value)
    }

    /** @todo, only apply this to closest 8 (configurable) avatars */

    for (const entity of networkedAvatarAudioEntities) {
      const networkObject = getComponent(entity, NetworkObjectComponent)

      const audioObj = avatarAudioStreams.get(networkObject)!
      if (!audioObj) continue

      const panner = AudioNodeGroups.get(audioObj)?.panner!
      if (!panner) continue

      getAvatarBoneWorldPosition(entity, 'Head', _vec3)
      const { rotation } = getComponent(entity, TransformComponent)

      updateAudioPanner(panner, _vec3, rotation, endTime)
    }

    /**
     * Update camera listener position
     */
    const { position, rotation } = getComponent(Engine.instance.currentWorld.cameraEntity, TransformComponent)
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
    removeQuery(world, positionalAudioSettingsQuery)
    world.sceneComponentRegistry.delete(PositionalAudioSettingsComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_AUDIO_SETTINGS)
    world.sceneComponentRegistry.delete(ImmersiveMediaTagComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_MEDIA_SETTINGS)
    removeActionQueue(modifyPropertyActionQueue)
    removeQuery(world, positionalAudioQuery)
    removeQuery(world, immersiveMediaQuery)
    removeQuery(world, networkedAvatarAudioQuery)
    removeActionQueue(setMediaStreamVolumeActionQueue)
    Engine.instance.spatialAudioSettings = {
      ...SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES
    }
  }

  return { execute, cleanup }
}
