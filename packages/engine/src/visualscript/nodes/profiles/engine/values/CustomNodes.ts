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

import { Tween } from '@tweenjs/tween.js'
import {
  AdditiveAnimationBlendMode,
  AnimationActionLoopStyles,
  AnimationBlendMode,
  LoopOnce,
  LoopPingPong,
  LoopRepeat,
  Material,
  MathUtils,
  Mesh,
  NormalAnimationBlendMode,
  Object3D
} from 'three'

import {
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { PositionalAudioComponent } from '@etherealengine/engine/src/audio/components/PositionalAudioComponent'
import { AnimationState } from '@etherealengine/engine/src/avatar/AnimationManager'
import { LoopAnimationComponent } from '@etherealengine/engine/src/avatar/components/LoopAnimationComponent'
import { MediaComponent } from '@etherealengine/engine/src/scene/components/MediaComponent'
import { VideoComponent } from '@etherealengine/engine/src/scene/components/VideoComponent'
import { PlayMode } from '@etherealengine/engine/src/scene/constants/PlayMode'
import { dispatchAction, getState } from '@etherealengine/hyperflux'
import { CameraActions } from '@etherealengine/spatial/src/camera/CameraState'
import { FollowCameraComponent } from '@etherealengine/spatial/src/camera/components/FollowCameraComponent'
import iterateObject3D from '@etherealengine/spatial/src/common/functions/iterateObject3D'
import { GroupComponent } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { TweenComponent } from '@etherealengine/spatial/src/transform/components/TweenComponent'
import { endXRSession, requestXRSession } from '@etherealengine/spatial/src/xr/XRSessionFunctions'
import { ContentFitType } from '@etherealengine/spatial/src/xrui/functions/ObjectFitFunctions'
import {
  NodeCategory,
  makeAsyncNodeDefinition,
  makeFlowNodeDefinition,
  makeFunctionNodeDefinition
} from '@etherealengine/visual-script'

import { addMediaComponent } from '../helper/assetHelper'

export const playVideo = makeFlowNodeDefinition({
  typeName: 'engine/media/playVideo',
  category: NodeCategory.Engine,
  label: 'Play video',
  in: {
    flow: 'flow',
    entity: 'entity',
    mediaPath: 'string',
    autoplay: 'boolean',
    volume: 'float',
    playMode: (_) => {
      const choices = Object.keys(PlayMode).map((key) => ({
        text: key,
        value: PlayMode[key as keyof typeof PlayMode]
      }))

      return {
        valueType: 'string',
        choices: choices,
        defaultValue: choices[0]
      }
    },
    videoFit: (_) => {
      const choices = ['cover', 'contain', 'vertical', 'horizontal']
      return {
        valueType: 'string',
        choices: choices,
        defaultValue: choices[0]
      }
    }
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit }) => {
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
  category: NodeCategory.Engine,
  label: 'Play audio',
  in: {
    flow: 'flow',
    entity: 'entity',
    mediaPath: 'string',
    autoplay: 'boolean',
    isMusic: 'boolean',
    volume: 'float',
    paused: 'boolean',
    seekTime: 'float',
    playMode: (_) => {
      const choices = Object.keys(PlayMode).map((key) => ({
        text: key,
        value: PlayMode[key as keyof typeof PlayMode]
      }))
      return {
        valueType: 'string',
        choices: choices,
        defaultValue: choices[0]
      }
    }
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit }) => {
    const entity = Number(read('entity')) as Entity
    let resources, volume
    if (hasComponent(entity, MediaComponent)) {
      const component = getComponent(entity, MediaComponent)
      resources = component.resources.length > 0 ? component.resources : []
      volume = component.volume
    }
    if (!hasComponent(entity, PositionalAudioComponent)) setComponent(entity, PositionalAudioComponent)
    const media = read<string>('mediaPath')
    resources = media ? [media, ...resources] : resources
    const autoplay = read<boolean>('autoplay')
    volume = MathUtils.clamp(read('volume') ?? volume, 0, 1)
    const playMode = read<PlayMode>('playMode')
    const paused = read<boolean>('paused')
    const seekTime = read<number>('seekTime')
    setComponent(entity, MediaComponent, {
      autoplay: autoplay,
      resources: resources,
      volume: volume,
      playMode: playMode!,
      seekTime: seekTime
    }) // play
    const component = getMutableComponent(entity, MediaComponent)
    component.paused.set(paused)
    commit('flow')
  }
})

/*
export const makeRaycast = makeFlowNodeDefinition({
  typeName: 'engine/playAudio',
  category: NodeCategory.Engine,
  label: 'Play audio',
  in: {
    flow: 'flow',
    entity: 'entity',
    mediaPath: 'string',
    paused: 'boolean',
    isMusic: 'boolean',
    volume: 'float',
    playMode: (_) => {
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
  triggered: ({ read, commit }) => {
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

export const getAnimationPack = makeFunctionNodeDefinition({
  typeName: 'engine/media/getAnimationPack',
  category: NodeCategory.Engine,
  label: 'Get Avatar Animations',
  in: {
    animationName: (_) => {
      const animations = getState(AnimationState).loadedAnimations
      const choices = Object.keys(animations).sort()
      choices.unshift('none')
      return {
        valueType: 'string',
        choices: choices
      }
    }
  },
  out: { animationPack: 'string' },
  exec: ({ read, write }) => {
    const animationPack: string = read('animationName')
    write('animationPack', animationPack)
  }
})

export const playAnimation = makeFlowNodeDefinition({
  typeName: 'engine/media/playAnimation',
  category: NodeCategory.Engine,
  label: 'Play animation',
  in: {
    flow: 'flow',
    entity: 'entity',
    paused: 'boolean',
    timeScale: 'float',
    animationPack: 'string',
    activeClipIndex: 'float',
    isAvatar: 'boolean'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit }) => {
    const entity = read<Entity>('entity')
    const paused = read<boolean>('paused')
    const timeScale = read<number>('timeScale')
    const animationPack = read<string>('animationPack')
    const activeClipIndex = read<number>('activeClipIndex')

    setComponent(entity, LoopAnimationComponent, {
      paused: paused,
      timeScale: timeScale,
      animationPack: animationPack,
      activeClipIndex: activeClipIndex
    })

    commit('flow')
  }
})

export const setAnimationAction = makeFlowNodeDefinition({
  typeName: 'engine/media/setAnimationAction',
  category: NodeCategory.Engine,
  label: 'Set animation action',
  in: {
    flow: 'flow',
    entity: 'entity',
    timeScale: 'float',
    blendMode: (_) => {
      const choices = [
        { text: 'normal', value: NormalAnimationBlendMode },
        { text: 'additive', value: AdditiveAnimationBlendMode }
      ]
      return {
        valueType: 'number',
        choices: choices,
        defaultValue: choices[0]
      }
    },
    loopMode: (_) => {
      const choices = [
        { text: 'once', value: LoopOnce },
        { text: 'repeat', value: LoopRepeat },
        { text: 'pingpong', value: LoopPingPong }
      ]
      return {
        valueType: 'number',
        choices: choices,
        defaultValue: choices[0]
      }
    },
    weight: 'float',
    clampWhenFinished: 'boolean',
    zeroSlopeAtStart: 'boolean',
    zeroSlopeAtEnd: 'boolean'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit }) => {
    const entity = read<Entity>('entity')
    const timeScale = read<number>('timeScale')
    const blendMode = read<AnimationBlendMode>('blendMode')
    const loopMode = read<AnimationActionLoopStyles>('loopMode')
    const clampWhenFinished = read<boolean>('clampWhenFinished')
    const zeroSlopeAtStart = read<boolean>('zeroSlopeAtStart')
    const zeroSlopeAtEnd = read<boolean>('zeroSlopeAtEnd')
    const weight = read<number>('weight')

    setComponent(entity, LoopAnimationComponent, {
      timeScale: timeScale,
      blendMode: blendMode,
      loop: loopMode,
      clampWhenFinished: clampWhenFinished,
      zeroSlopeAtStart: zeroSlopeAtStart,
      zeroSlopeAtEnd: zeroSlopeAtEnd,
      weight: weight
    })

    commit('flow')
  }
})

const initialState = () => {}
export const loadAsset = makeAsyncNodeDefinition({
  typeName: 'engine/asset/loadAsset',
  category: NodeCategory.Engine,
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
        write('entity', entity)
        finished?.()
      })
    })

    return null
  },
  dispose: () => {
    return initialState()
  }
})

export const fadeCamera = makeFlowNodeDefinition({
  typeName: 'engine/camera/cameraFade',
  category: NodeCategory.Engine,
  label: 'Camera fade',
  in: {
    flow: 'flow',
    toBlack: 'boolean'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit }) => {
    dispatchAction(
      CameraActions.fadeToBlack({
        in: read('toBlack')
      })
    )
    commit('flow')
  }
})

export const setCameraZoom = makeFlowNodeDefinition({
  typeName: 'engine/camera/setCameraZoom',
  category: NodeCategory.Engine,
  label: 'Set camera zoom',
  in: {
    flow: 'flow',
    zoom: 'float'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit }) => {
    const entity = Engine.instance.cameraEntity
    const zoom = read<number>('zoom')
    setComponent(entity, FollowCameraComponent, { zoomLevel: zoom })
    commit('flow')
  }
})

export const startXRSession = makeFlowNodeDefinition({
  typeName: 'engine/xr/startSession',
  category: NodeCategory.Engine,
  label: 'Start XR Session',
  in: {
    flow: 'flow',
    XRmode: (_) => {
      const choices = ['inline', 'immersive-ar', 'immersive-vr']
      return {
        valueType: 'string',
        choices: choices,
        defaultValue: choices[0]
      }
    }
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit }) => {
    const XRmode = read<'inline' | 'immersive-ar' | 'immersive-vr'>('XRmode')
    requestXRSession({ mode: XRmode })
    commit('flow')
  }
})

export const finishXRSession = makeFlowNodeDefinition({
  typeName: 'engine/xr/endSession',
  category: NodeCategory.Engine,
  label: 'End XR Session',
  in: {
    flow: 'flow'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit }) => {
    endXRSession()
    commit('flow')
  }
})

export const switchScene = makeFlowNodeDefinition({
  typeName: 'engine/switchScene',
  category: NodeCategory.Engine,
  label: 'Switch Scene',
  in: {
    flow: 'flow',
    projectName: 'string', // i wish i could access the ProjectState
    sceneName: 'string'
  },
  out: {},
  initialState: undefined,
  triggered: ({ read, commit }) => {
    // const projectName = read<string>('projectName')
    // const sceneName = read<string>('sceneName')
    // SceneServices.setCurrentScene(projectName, sceneName)
  }
})

export const group = makeFunctionNodeDefinition({
  typeName: 'group',
  in: {},
  out: {},
  exec: ({ read, write, graph }) => {}
})

export const redirectToURL = makeFlowNodeDefinition({
  typeName: 'engine/redirectToURL',
  category: NodeCategory.Engine,
  label: 'Redirect to URL',
  in: {
    flow: 'flow',
    url: 'string'
  },
  out: {},
  initialState: undefined,
  triggered: ({ read, commit }) => {
    const url = read<string>('url')
    window.location.assign(url)
  }
})

/**
 * fadeMesh: fade in/out mesh
 */
export const fadeMesh = makeFlowNodeDefinition({
  typeName: 'engine/fadeMesh',
  category: NodeCategory.Engine,
  label: 'Fade Mesh',
  in: {
    flow: 'flow',
    entity: 'entity',
    fadeOut: 'boolean',
    duration: 'float'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit }) => {
    const entity = read<Entity>('entity')
    const fadeOut = read<boolean>('fadeOut')
    const duration = read<number>('duration')

    const obj3d: Object3D | null = getOptionalComponent(entity, GroupComponent)?.[0] ?? null
    const meshMaterials = obj3d
      ? iterateObject3D(
          obj3d,
          (child: Mesh) => {
            const result = child.material as Material
            result.transparent = true
            return result
          },
          (child: Mesh) =>
            child?.isMesh &&
            !!child.material &&
            !Array.isArray(child.material) &&
            typeof child.material.transparent === 'boolean'
        )
      : []

    const opacitySlider: { opacity: number; _opacity: number } = { opacity: 1, _opacity: 1 }
    Object.defineProperty(opacitySlider, 'opacity', {
      get: () => opacitySlider._opacity,
      set: (value) => {
        opacitySlider._opacity = value
        for (const material of meshMaterials) {
          material.opacity = value
        }
      }
    })
    if (fadeOut) {
      opacitySlider.opacity = 1
      setComponent(
        entity,
        TweenComponent,
        new Tween<any>(opacitySlider)
          .to({ opacity: 0 }, duration * 1000)
          .start()
          .onComplete(() => {
            removeComponent(entity, TweenComponent)
          })
      )
    } else {
      opacitySlider.opacity = 0
      setComponent(
        entity,
        TweenComponent,
        new Tween<any>(opacitySlider)
          .to({ opacity: 1 }, duration * 1000)
          .start()
          .onComplete(() => {
            removeComponent(entity, TweenComponent)
          })
      )
    }
    commit('flow')
  }
})

//scene transition
