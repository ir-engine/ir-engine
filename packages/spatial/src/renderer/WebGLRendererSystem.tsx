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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { SMAAPreset } from 'postprocessing'
import React, { useEffect } from 'react'
import { ArrayCamera, Color, CubeTexture, Fog, FogExp2, Object3D, Scene, Texture } from 'three'

import {
  ComponentType,
  defineQuery,
  defineSystem,
  ECSState,
  Entity,
  getComponent,
  getOptionalComponent,
  hasComponent,
  PresentationSystemGroup,
  QueryReactor,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { defineState, getMutableState, getState, useMutableState } from '@ir-engine/hyperflux'

import { getNestedChildren } from '@ir-engine/ecs'
import { EffectPass, OutlineEffect } from 'postprocessing'
import { CameraComponent } from '../camera/components/CameraComponent'
import { XRState } from '../xr/XRState'
import { ObjectComponent } from './components/ObjectComponent'
import { ObjectLayerMaskComponent } from './components/ObjectLayerComponent'
import { RendererComponent } from './components/RendererComponent'
import { BackgroundComponent, EnvironmentMapComponent, FogComponent } from './components/SceneComponents'
import { VisibleComponent } from './components/VisibleComponent'
import { ObjectLayers } from './constants/ObjectLayers'
import { RenderModes } from './constants/RenderModes'
import { CSM } from './csm/CSM'
import { CSMComponent } from './csm/CSMComponent'
import { changeRenderMode } from './functions/changeRenderMode'
import { PerformanceManager, PerformanceState } from './PerformanceState'
import { RendererState } from './RendererState'

declare module 'postprocessing' {
  interface EffectComposer {
    EffectPass: EffectPass
    OutlineEffect: OutlineEffect
  }
  interface Effect {
    isActive: boolean
  }
}

/**
 * Executes the system. Called each frame by default from the Engine.instance.
 * @param delta Time since last frame.
 */
export const render = (
  renderer: ComponentType<typeof RendererComponent>,
  scene: Scene,
  camera: ArrayCamera,
  delta: number,
  effectComposer = true,
  csm?: ComponentType<typeof CSMComponent> | undefined
) => {
  if (!renderer.renderer) return

  const xrFrame = getState(XRState).xrFrame

  const canvasParent = renderer.canvas!.parentElement
  if (!canvasParent) return

  const state = getState(RendererState)

  if (renderer.needsResize) {
    const curPixelRatio = renderer.renderer!.getPixelRatio()
    const scaledPixelRatio = window.devicePixelRatio * state.renderScale

    if (curPixelRatio !== scaledPixelRatio) renderer.renderer!.setPixelRatio(scaledPixelRatio)

    const width = canvasParent.clientWidth
    const height = canvasParent.clientHeight

    if (camera.isPerspectiveCamera) {
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    if (state.useShadows && csm) {
      // Call the CSM updateFrustums function
      CSM.updateFrustums()
    }

    if (renderer.effectComposer) {
      renderer.effectComposer.setSize(width, height, true)
    } else {
      renderer.renderer.setSize(width, height, true)
    }

    renderer.needsResize = false
  }

  ObjectComponent.activeRender = true

  /** Postprocessing does not support multipass yet, so just use basic renderer when in VR */
  for (const c of camera.cameras) c.layers.mask = camera.layers.mask

  if (xrFrame || !effectComposer || !renderer.effectComposer) {
    renderer.renderer.clear()
    renderer.renderer.render(scene, camera)
  } else {
    renderer.effectComposer.setMainScene(scene)
    renderer.effectComposer.setMainCamera(camera)
    renderer.effectComposer.render(delta)
  }

  ObjectComponent.activeRender = false
}

export const RenderSettingsState = defineState({
  name: 'RenderSettingsState',
  initial: {
    smaaPreset: SMAAPreset.MEDIUM
  }
})

const rendererQuery = defineQuery([RendererComponent, CameraComponent])

export const filterVisible = (entity: Entity) => hasComponent(entity, VisibleComponent)
export const getNestedVisibleChildren = (entity: Entity) => getNestedChildren(entity, filterVisible)
export const getSceneParameters = (entities: Entity[], cameraEntity: Entity) => {
  const vals = {
    background: null as Color | Texture | CubeTexture | null,
    environment: null as Texture | null,
    fog: null as Fog | FogExp2 | null,
    children: [] as Object3D[]
  }

  const cameraLayers = ObjectLayerMaskComponent.mask[cameraEntity]

  for (const entity of entities) {
    if (hasComponent(entity, EnvironmentMapComponent)) {
      vals.environment = getComponent(entity, EnvironmentMapComponent)
    }
    if (hasComponent(entity, BackgroundComponent)) {
      vals.background = getComponent(entity, BackgroundComponent as any) as Color | Texture | CubeTexture
    }
    if (hasComponent(entity, FogComponent)) {
      vals.fog = getComponent(entity, FogComponent)
    }
    // layer mask is faster with bitecs here than going through the object's proxy
    const shouldRender = (ObjectLayerMaskComponent.mask[entity] & cameraLayers) !== 0
    if (shouldRender && hasComponent(entity, ObjectComponent)) {
      vals.children.push(getComponent(entity, ObjectComponent))
    }
  }

  return vals
}

const execute = () => {
  const deltaSeconds = getState(ECSState).deltaSeconds

  const onRenderEnd = PerformanceManager.profileGPURender()
  for (const entity of rendererQuery()) {
    const camera = getComponent(entity, CameraComponent)
    const renderer = getComponent(entity, RendererComponent)
    const csm = getOptionalComponent(entity, CSMComponent)
    const _scene = renderer.scene!

    const entitiesToRender = renderer.scenes.map(getNestedVisibleChildren).flat()
    const { background, environment, fog, children } = getSceneParameters(entitiesToRender, entity)
    _scene.children = children

    const renderMode = getState(RendererState).renderMode

    const sessionMode = getState(XRState).sessionMode
    _scene.background =
      sessionMode === 'immersive-ar' ? null : renderMode === RenderModes.WIREFRAME ? new Color(0xffffff) : background

    _scene.environment = environment

    _scene.fog = fog

    render(renderer, _scene, camera, deltaSeconds, undefined, csm)
  }
  onRenderEnd()
}

const rendererReactor = () => {
  const entity = useEntityContext()
  const renderer = useComponent(entity, RendererComponent)
  const engineRendererSettings = useMutableState(RendererState)

  useEffect(() => {
    if (engineRendererSettings.automatic.value) return

    const qualityLevel = engineRendererSettings.qualityLevel.value
    getMutableState(PerformanceState).merge({
      gpuTier: qualityLevel,
      cpuTier: qualityLevel
    } as any)
  }, [engineRendererSettings.qualityLevel, engineRendererSettings.automatic])

  useEffect(() => {
    if (!renderer.renderer.value) return
    renderer.renderer.value.setPixelRatio(window.devicePixelRatio * engineRendererSettings.renderScale.value)
    renderer.needsResize.set(true)
  }, [engineRendererSettings.renderScale, !!renderer.renderer.value])

  useEffect(() => {
    changeRenderMode(entity)
  }, [engineRendererSettings.renderMode])

  return null
}

const cameraReactor = () => {
  const entity = useEntityContext()
  const camera = useComponent(entity, CameraComponent).value
  const engineRendererSettings = useMutableState(RendererState)

  useEffect(() => {
    if (engineRendererSettings.physicsDebug.value) camera.layers.enable(ObjectLayers.Helper)
    else camera.layers.disable(ObjectLayers.Helper)
  }, [engineRendererSettings.physicsDebug])

  useEffect(() => {
    if (engineRendererSettings.avatarDebug.value) camera.layers.enable(ObjectLayers.Helper)
    else camera.layers.disable(ObjectLayers.Helper)
  }, [engineRendererSettings.avatarDebug])

  useEffect(() => {
    if (engineRendererSettings.gridVisibility.value) camera.layers.enable(ObjectLayers.Gizmos)
    else camera.layers.disable(ObjectLayers.Gizmos)
  }, [engineRendererSettings.gridVisibility])

  // the studio icons exist on the same layer as the selected gizmos, so disabling the node helper layer also hides the studio icons, which is not desired
  useEffect(() => {
    if (engineRendererSettings.nodeHelperVisibility.value) camera.layers.enable(ObjectLayers.Helper)
    else camera.layers.disable(ObjectLayers.Helper)
  }, [engineRendererSettings.nodeHelperVisibility])

  useEffect(() => {
    if (engineRendererSettings.nodeIconVisibility.value) camera.layers.enable(ObjectLayers.Helper)
    else camera.layers.disable(ObjectLayers.Helper)
  }, [engineRendererSettings.nodeIconVisibility])

  /*useEffect(() => {
    if (engineRendererSettings.nodeHelperVisibility.value) camera.layers.enable(ObjectLayers.Helper)
    else camera.layers.disable(ObjectLayers.Helper)
  }, [engineRendererSettings.nodeHelperVisibility])*/

  return null
}

export const WebGLRendererSystem = defineSystem({
  uuid: 'ee.engine.WebGLRendererSystem',
  insert: { with: PresentationSystemGroup },
  execute,
  reactor: () => {
    return (
      <>
        <QueryReactor Components={[RendererComponent]} ChildEntityReactor={rendererReactor} />
        <QueryReactor Components={[CameraComponent]} ChildEntityReactor={cameraReactor} />
      </>
    )
  }
})
