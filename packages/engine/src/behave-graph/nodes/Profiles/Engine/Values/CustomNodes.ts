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

import {
  NodeCategory,
  makeAsyncNodeDefinition,
  makeFlowNodeDefinition,
  makeFunctionNodeDefinition
} from '@behave-graph/core'
import { dispatchAction, getState } from '@etherealengine/hyperflux'
import {
  AdditiveAnimationBlendMode,
  AnimationActionLoopStyles,
  AnimationBlendMode,
  LoopOnce,
  LoopPingPong,
  LoopRepeat,
  MathUtils,
  NormalAnimationBlendMode
} from 'three'
import { PositionalAudioComponent } from '../../../../../audio/components/PositionalAudioComponent'
import { AnimationState } from '../../../../../avatar/AnimationManager'
import { LoopAnimationComponent } from '../../../../../avatar/components/LoopAnimationComponent'
import { CameraActions } from '../../../../../camera/CameraState'
import { FollowCameraComponent } from '../../../../../camera/components/FollowCameraComponent'
import { Engine } from '../../../../../ecs/classes/Engine'
import { Entity } from '../../../../../ecs/classes/Entity'
import { SceneServices } from '../../../../../ecs/classes/Scene'
import {
  getComponent,
  getMutableComponent,
  hasComponent,
  setComponent
} from '../../../../../ecs/functions/ComponentFunctions'
import { StandardCallbacks, getCallback } from '../../../../../scene/components/CallbackComponent'
import { MediaComponent } from '../../../../../scene/components/MediaComponent'
import { VideoComponent } from '../../../../../scene/components/VideoComponent'
import { PlayMode } from '../../../../../scene/constants/PlayMode'
import { endXRSession, requestXRSession } from '../../../../../xr/XRSessionFunctions'
import { ContentFitType } from '../../../../../xrui/functions/ObjectFitFunctions'
import { addMediaComponent } from '../helper/assetHelper'

export const playVideo = makeFlowNodeDefinition({
  typeName: 'engine/media/playVideo',
  category: NodeCategory.Action,
  label: 'Play video',
  in: {
    flow: 'flow',
    entity: 'entity',
    mediaPath: 'string',
    autoplay: 'boolean',
    volume: 'float',
    playMode: (_, graphApi) => {
      const choices = Object.keys(PlayMode).map((key) => ({
        text: key,
        value: PlayMode[key as keyof typeof PlayMode]
      }))
      return {
        valueType: 'string',
        choices: choices
      }
    },
    videoFit: (_, graphApi) => {
      const choices = [
        { text: 'cover', value: 'cover' },
        { text: 'contain', value: 'contain' },
        { text: 'vertical', value: 'vertical' },
        { text: 'horizontal', value: 'horizontal' }
      ]
      return {
        valueType: 'string',
        choices: choices
      }
    }
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
    const entity = Number(read('entity')) as Entity
    let resources, volume
    if (hasComponent(entity, MediaComponent)) {
      const component = getComponent(entity, MediaComponent)
      resources = component.resources.length > 0 ? component.resources : []
      volume = component.volume
    }
    setComponent(entity, PositionalAudioComponent)
    const media = read<string>('mediaPath')
    resources = media ? [media, ...resources] : resources
    const autoplay = read<boolean>('autoplay')
    volume = MathUtils.clamp(read('volume') ?? volume, 0, 1)
    const videoFit: ContentFitType = read('videoFit')
    const playMode = read<PlayMode>('playMode')

    setComponent(entity, VideoComponent, { fit: videoFit }) // play
    setComponent(entity, MediaComponent, {
      autoplay: autoplay,
      resources: resources,
      volume: volume,
      playMode: playMode!
    }) // play
    commit('flow')
  }
})

export const playAudio = makeFlowNodeDefinition({
  typeName: 'engine/media/playAudio',
  category: NodeCategory.Action,
  label: 'Play audio',
  in: {
    flow: 'flow',
    entity: 'entity',
    mediaPath: 'string',
    autoplay: 'boolean',
    isMusic: 'boolean',
    volume: 'float',
    playMode: (_, graphApi) => {
      const choices = Object.keys(PlayMode).map((key) => ({
        text: key,
        value: PlayMode[key as keyof typeof PlayMode]
      }))
      return {
        valueType: 'string',
        choices: choices
      }
    }
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
    const entity = Number(read('entity')) as Entity
    let resources, volume
    if (hasComponent(entity, MediaComponent)) {
      const component = getComponent(entity, MediaComponent)
      resources = component.resources.length > 0 ? component.resources : []
      volume = component.volume
    }
    setComponent(entity, PositionalAudioComponent)
    const media = read<string>('mediaPath')
    resources = media ? [media, ...resources] : resources
    const autoplay = read<boolean>('autoplay')
    volume = MathUtils.clamp(read('volume') ?? volume, 0, 1)
    const playMode = read<PlayMode>('playMode')
    setComponent(entity, MediaComponent, {
      autoplay: autoplay,
      resources: resources,
      volume: volume,
      playMode: playMode!
    }) // play
    const component = getMutableComponent(entity, MediaComponent)
    component.paused.set(false)
    commit('flow')
  }
})

/*
export const makeRaycast = makeFlowNodeDefinition({
  typeName: 'engine/playAudio',
  category: NodeCategory.Action,
  label: 'Play audio',
  in: {
    flow: 'flow',
    entity: 'entity',
    mediaPath: 'string',
    paused: 'boolean',
    isMusic: 'boolean',
    volume: 'float',
    playMode: (_, graphApi) => {
      const choices = Object.keys(PlayMode).map((key) => ({
        text: key,
        value: PlayMode[key as keyof typeof PlayMode]
      }))
      return {
        valueType: 'string',
        choices: choices
      }
    }
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
    const entity = Number(read('entity')) as Entity
    let resources, volume
    if (hasComponent(entity, MediaComponent)) {
      const component = getComponent(entity, MediaComponent)
      resources = component.resources.length > 0 ? component.resources : []
      volume = component.volume
    }
    setComponent(entity, PositionalAudioComponent)
    const media = read<string>('mediaPath')
    resources = media ? [media, ...resources] : resources
    const paused = read<boolean>('paused')
    volume = MathUtils.clamp(read('volume') ?? volume, 0, 1)
    const playMode = read<PlayMode>('playMode')
    setComponent(entity, MediaComponent, { paused: paused, resources: resources, volume: volume, playMode: playMode! }) // play
    const component = getComponent(entity, MediaComponent)
    commit('flow')
  }
})*/

export const getAvatarAnimations = makeFunctionNodeDefinition({
  typeName: 'engine/media/getAvatarAnimations',
  category: NodeCategory.Query,
  label: 'Get Avatar Animations',
  in: {
    animationName: (_, graphApi) => {
      const animations = getState(AnimationState).loadedAnimations
      const choices = Object.keys(animations).sort()
      choices.unshift('none')
      return {
        valueType: 'string',
        choices: choices
      }
    }
  },
  out: { animationName: 'string' },
  exec: ({ read, write, graph }) => {
    const animationName: string = read('animationName')
    write('animationName', animationName)
  }
})

export const playAnimation = makeFlowNodeDefinition({
  typeName: 'engine/media/playAnimation',
  category: NodeCategory.Action,
  label: 'Play animation',
  in: {
    flow: 'flow',
    entity: 'entity',
    action: (_, graphApi) => {
      const choices = [
        { text: 'play', value: StandardCallbacks.PLAY },
        { text: 'pause', value: StandardCallbacks.PAUSE },
        { text: 'stop', value: StandardCallbacks.STOP }
      ]
      return {
        valueType: 'string',
        choices: choices
      }
    },
    animationSpeed: 'float',
    animationPack: 'string',
    activeClipIndex: 'float',
    isAvatar: 'boolean'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
    const entity = read<Entity>('entity')
    const action = read<StandardCallbacks>('action') ?? StandardCallbacks.PLAY
    const animationSpeed = read<number>('animationSpeed')
    const animationPack = read<string>('animationPack')
    const activeClipIndex = read<number>('activeClipIndex')
    const isAvatar = read<boolean>('isAvatar')
    setComponent(entity, LoopAnimationComponent, {
      hasAvatarAnimations: isAvatar,
      animationSpeed: animationSpeed,
      animationPack: animationPack,
      activeClipIndex: activeClipIndex
    })

    const trigger = getCallback(entity, action)
    trigger?.()

    commit('flow')
  }
})

export const setAnimationAction = makeFlowNodeDefinition({
  typeName: 'engine/media/setAnimationAction',
  category: NodeCategory.Action,
  label: 'Set animation action',
  in: {
    flow: 'flow',
    entity: 'entity',
    animationSpeed: 'float',
    blendMode: (_, graphApi) => {
      const choices = [
        { text: 'normal', value: NormalAnimationBlendMode },
        { text: 'additive', value: AdditiveAnimationBlendMode }
      ]
      return {
        valueType: 'number',
        choices: choices
      }
    },
    loopMode: (_, graphApi) => {
      const choices = [
        { text: 'once', value: LoopOnce },
        { text: 'repeat', value: LoopRepeat },
        { text: 'pingpong', value: LoopPingPong }
      ]
      return {
        valueType: 'number',
        choices: choices
      }
    },
    weight: 'float',
    clampWhenFinished: 'boolean',
    zeroSlopeAtStart: 'boolean',
    zeroSlopeAtEnd: 'boolean'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
    const entity = read<Entity>('entity')
    const animationSpeed = read<number>('animationSpeed')
    const blendMode = read<AnimationBlendMode>('blendMode')
    const loopMode = read<AnimationActionLoopStyles>('loopMode')
    const clampWhenFinished = read<boolean>('clampWhenFinished')
    const zeroSlopeAtStart = read<boolean>('zeroSlopeAtStart')
    const zeroSlopeAtEnd = read<boolean>('zeroSlopeAtEnd')
    const weight = read<number>('weight')
    setComponent(entity, LoopAnimationComponent, { animationSpeed: animationSpeed })
    const animAction = getComponent(entity, LoopAnimationComponent).action
    if (animAction) {
      animAction!.blendMode = blendMode
      animAction!.loop = loopMode
      animAction!.clampWhenFinished = clampWhenFinished
      animAction!.zeroSlopeAtStart = zeroSlopeAtStart
      animAction!.zeroSlopeAtEnd = zeroSlopeAtEnd
      animAction!.weight = weight
      setComponent(entity, LoopAnimationComponent, { action: animAction })
    }

    commit('flow')
  }
})

const initialState = () => {}
export const loadAsset = makeAsyncNodeDefinition({
  typeName: 'engine/asset/loadAsset',
  category: NodeCategory.Action,
  label: 'Load asset',
  in: {
    flow: 'flow',
    assetPath: 'string'
  },
  out: { flow: 'flow', loadEnd: 'flow', entity: 'entity' },
  initialState: initialState(),
  triggered: ({ read, write, commit, finished }) => {
    const loadAsset = async () => {
      const assetPath = read<string>('assetPath')
      const node = await addMediaComponent(assetPath)
      return node
    }

    commit('flow', async () => {
      const entity = await loadAsset()
      write('entity', entity)
      commit('loadEnd', () => {
        finished?.()
      })
    })
    return null
  },
  dispose: ({ state, graph: { getDependency } }) => {
    return initialState()
  }
})

export const fadeCamera = makeFlowNodeDefinition({
  typeName: 'engine/camera/cameraFade',
  category: NodeCategory.Action,
  label: 'Camera fade',
  in: {
    flow: 'flow',
    toBlack: 'boolean',
    graphicTexture: 'string'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
    dispatchAction(
      CameraActions.fadeToBlack({
        in: read('toBlack'),
        graphicTexture: read('graphicTexture')
      })
    )
    commit('flow')
  }
})

export const setCameraZoom = makeFlowNodeDefinition({
  typeName: 'engine/camera/setCameraZoom',
  category: NodeCategory.Action,
  label: 'Set camera zoom',
  in: {
    flow: 'flow',
    zoom: 'float'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
    const entity = Engine.instance.cameraEntity
    const zoom = read<number>('zoom')
    setComponent(entity, FollowCameraComponent, { zoomLevel: zoom })
    commit('flow')
  }
})

export const startXRSession = makeFlowNodeDefinition({
  typeName: 'engine/xr/startSession',
  category: NodeCategory.Action,
  label: 'Start XR Session',
  in: {
    flow: 'flow',
    XRmode: (_, graphApi) => {
      const choices = ['inline', 'immersive-ar', 'immersive-vr']
      return {
        valueType: 'string',
        choices: choices
      }
    }
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
    const XRmode = read<'inline' | 'immersive-ar' | 'immersive-vr'>('XRmode')
    requestXRSession({ mode: XRmode })
    commit('flow')
  }
})

export const finishXRSession = makeFlowNodeDefinition({
  typeName: 'engine/xr/endSession',
  category: NodeCategory.Action,
  label: 'End XR Session',
  in: {
    flow: 'flow'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
    endXRSession()
    commit('flow')
  }
})

export const switchScene = makeFlowNodeDefinition({
  typeName: 'engine/switchScene',
  category: NodeCategory.Action,
  label: 'Switch Scene',
  in: {
    flow: 'flow',
    projectName: 'string',
    sceneName: 'string'
  },
  out: {},
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
    const projectName = read<string>('projectName')
    const sceneName = read<string>('sceneName')
    SceneServices.setCurrentScene(projectName, sceneName)
  }
})

//scene transition
