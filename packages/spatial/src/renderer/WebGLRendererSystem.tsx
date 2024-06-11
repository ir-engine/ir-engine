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

import '../threejsPatches'

import { EffectComposer, NormalPass, RenderPass, SMAAPreset } from 'postprocessing'
import React, { useEffect } from 'react'
import {
  ArrayCamera,
  Color,
  CubeTexture,
  FogBase,
  Object3D,
  Scene,
  SRGBColorSpace,
  Texture,
  WebGL1Renderer,
  WebGLRenderer,
  WebGLRendererParameters
} from 'three'

import {
  defineComponent,
  defineQuery,
  defineSystem,
  ECSState,
  Entity,
  getComponent,
  hasComponent,
  PresentationSystemGroup,
  QueryReactor,
  useComponent,
  useEntityContext
} from '@etherealengine/ecs'
import { defineState, getMutableState, getState, useMutableState } from '@etherealengine/hyperflux'

import { CameraComponent } from '../camera/components/CameraComponent'
import { getNestedChildren } from '../transform/components/EntityTree'
import { createWebXRManager, WebXRManager } from '../xr/WebXRManager'
import { XRLightProbeState } from '../xr/XRLightProbeSystem'
import { XRState } from '../xr/XRState'
import { GroupComponent } from './components/GroupComponent'
import {
  BackgroundComponent,
  EnvironmentMapComponent,
  FogComponent,
  SceneComponent
} from './components/SceneComponents'
import { VisibleComponent } from './components/VisibleComponent'
import { ObjectLayers } from './constants/ObjectLayers'
import { RenderModes } from './constants/RenderModes'
import { CSM } from './csm/CSM'
import CSMHelper from './csm/CSMHelper'
import { changeRenderMode } from './functions/changeRenderMode'
import { PerformanceManager, PerformanceState } from './PerformanceState'
import { RendererState } from './RendererState'
import WebGL from './THREE.WebGL'

export const RendererComponent = defineComponent({
  name: 'RendererComponent',

  onInit() {
    return new EngineRenderer()
  },

  onSet(entity, component, json) {
    if (json?.canvas) component.canvas.set(json.canvas)
  }
})

let lastRenderTime = 0
const _scene = new Scene()
_scene.matrixAutoUpdate = false
_scene.matrixWorldAutoUpdate = false
_scene.layers.set(ObjectLayers.Scene)
globalThis._scene = _scene

export class EngineRenderer {
  /**
   * @deprecated will be removed once threejs objects are not proxified. Should only be used in loadGLTFModel.ts
   * see https://github.com/EtherealEngine/etherealengine/issues/9308
   */
  static activeRender = false
  /** Is resize needed? */
  needsResize: boolean

  renderPass: RenderPass
  normalPass: NormalPass
  renderContext: WebGLRenderingContext | WebGL2RenderingContext

  supportWebGL2: boolean
  canvas: HTMLCanvasElement

  renderer: WebGLRenderer = null!
  effectComposer: EffectComposer = null!
  /** @todo deprecate and replace with engine implementation */
  xrManager: WebXRManager = null!
  webGLLostContext: any = null

  csm = null as CSM | null
  csmHelper = null as CSMHelper | null

  initialize() {
    this.supportWebGL2 = WebGL.isWebGL2Available()

    if (!this.canvas) throw new Error('Canvas is not defined')

    const canvas = this.canvas
    const context = this.supportWebGL2 ? canvas.getContext('webgl2')! : canvas.getContext('webgl')!

    this.renderContext = context!
    const options: WebGLRendererParameters = {
      precision: 'highp',
      powerPreference: 'high-performance',
      stencil: false,
      antialias: false,
      depth: true,
      logarithmicDepthBuffer: false,
      canvas,
      context,
      preserveDrawingBuffer: false,
      //@ts-ignore
      multiviewStereo: true
    }

    const renderer = this.supportWebGL2 ? new WebGLRenderer(options) : new WebGL1Renderer(options)
    this.renderer = renderer
    this.renderer.outputColorSpace = SRGBColorSpace
    this.renderer.debug.checkShaderErrors = true

    // DISABLE THIS IF YOU ARE SEEING SHADER MISBEHAVING - UNCHECK THIS WHEN TESTING UPDATING THREEJS
    this.renderer.debug.checkShaderErrors = true

    // @ts-ignore
    this.xrManager = renderer.xr = createWebXRManager(renderer)
    this.xrManager.cameraAutoUpdate = false
    this.xrManager.enabled = true

    const onResize = () => {
      this.needsResize = true
    }

    canvas.addEventListener('resize', onResize, false)
    window.addEventListener('resize', onResize, false)

    this.renderer.autoClear = true

    /**
     * This can be tested with document.getElementById('engine-renderer-canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext();
     */
    this.webGLLostContext = context.getExtension('WEBGL_lose_context')

    const handleWebGLConextLost = (e) => {
      console.log('Browser lost the context.', e)
      e.preventDefault()
      this.needsResize = false
      setTimeout(() => {
        if (this.webGLLostContext) this.webGLLostContext.restoreContext()
      }, 1)
    }

    const handleWebGLContextRestore = (e) => {
      canvas.removeEventListener('webglcontextlost', handleWebGLConextLost)
      canvas.removeEventListener('webglcontextrestored', handleWebGLContextRestore)
      this.initialize()
      this.needsResize = true
      console.log("Browser's context is restored.", e)
    }

    if (this.webGLLostContext) {
      canvas.addEventListener('webglcontextlost', handleWebGLConextLost)
    } else {
      console.log('Browser does not support `WEBGL_lose_context` extension')
    }
  }
}

/**
 * Executes the system. Called each frame by default from the Engine.instance.
 * @param delta Time since last frame.
 */
export const render = (
  renderer: EngineRenderer,
  scene: Scene,
  camera: ArrayCamera,
  delta: number,
  effectComposer = true
) => {
  const xrFrame = getState(XRState).xrFrame

  const canvasParent = renderer.canvas.parentElement
  if (!canvasParent) return

  const state = getState(RendererState)

  if (renderer.needsResize) {
    const curPixelRatio = renderer.renderer.getPixelRatio()
    const scaledPixelRatio = window.devicePixelRatio * state.renderScale

    if (curPixelRatio !== scaledPixelRatio) renderer.renderer.setPixelRatio(scaledPixelRatio)

    const width = canvasParent.clientWidth
    const height = canvasParent.clientHeight

    if (camera.isPerspectiveCamera) {
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    state.updateCSMFrustums && renderer.csm?.updateFrustums()

    if (renderer.effectComposer) {
      renderer.effectComposer.setSize(width, height, true)
    } else {
      renderer.renderer.setSize(width, height, true)
    }

    renderer.needsResize = false
  }

  EngineRenderer.activeRender = true

  /** Postprocessing does not support multipass yet, so just use basic renderer when in VR */
  if (xrFrame || !effectComposer || !renderer.effectComposer) {
    for (const c of camera.cameras) c.layers.mask = camera.layers.mask
    renderer.renderer.clear()
    renderer.renderer.render(scene, camera)
  } else {
    renderer.effectComposer.setMainScene(scene)
    renderer.effectComposer.setMainCamera(camera)
    renderer.effectComposer.render(delta)
  }

  EngineRenderer.activeRender = false
}

export const RenderSettingsState = defineState({
  name: 'RenderSettingsState',
  initial: {
    smaaPreset: SMAAPreset.MEDIUM
  }
})

const rendererQuery = defineQuery([RendererComponent, CameraComponent, SceneComponent])

export const filterVisible = (entity: Entity) => hasComponent(entity, VisibleComponent)
export const getNestedVisibleChildren = (entity: Entity) => getNestedChildren(entity, filterVisible)
export const getSceneParameters = (entities: Entity[]) => {
  const vals = {
    background: null as Color | Texture | CubeTexture | null,
    environment: null as Texture | null,
    fog: null as FogBase | null,
    children: [] as Object3D[]
  }

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
    if (hasComponent(entity, GroupComponent)) {
      vals.children.push(...getComponent(entity, GroupComponent)!)
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
    const scene = getComponent(entity, SceneComponent)

    const entitiesToRender = scene.children.map(getNestedVisibleChildren).flat()
    const { background, environment, fog, children } = getSceneParameters(entitiesToRender)
    _scene.children = children

    const renderMode = getState(RendererState).renderMode

    const sessionMode = getState(XRState).sessionMode
    _scene.background =
      sessionMode === 'immersive-ar' ? null : renderMode === RenderModes.WIREFRAME ? new Color(0xffffff) : background

    const lightProbe = getState(XRLightProbeState).environment
    _scene.environment = lightProbe ?? environment

    _scene.fog = fog

    render(renderer, _scene, camera, deltaSeconds)
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
    renderer.renderer.value.setPixelRatio(window.devicePixelRatio * engineRendererSettings.renderScale.value)
    renderer.needsResize.set(true)
  }, [engineRendererSettings.renderScale])

  useEffect(() => {
    changeRenderMode()
  }, [engineRendererSettings.renderMode])

  return null
}

const cameraReactor = () => {
  const entity = useEntityContext()
  const camera = useComponent(entity, CameraComponent).value
  const engineRendererSettings = useMutableState(RendererState)

  useEffect(() => {
    if (engineRendererSettings.physicsDebug.value) camera.layers.enable(ObjectLayers.PhysicsHelper)
    else camera.layers.disable(ObjectLayers.PhysicsHelper)
  }, [engineRendererSettings.physicsDebug])

  useEffect(() => {
    if (engineRendererSettings.avatarDebug.value) camera.layers.enable(ObjectLayers.AvatarHelper)
    else camera.layers.disable(ObjectLayers.AvatarHelper)
  }, [engineRendererSettings.avatarDebug])

  useEffect(() => {
    if (engineRendererSettings.gridVisibility.value) camera.layers.enable(ObjectLayers.Gizmos)
    else camera.layers.disable(ObjectLayers.Gizmos)
  }, [engineRendererSettings.gridVisibility])

  useEffect(() => {
    if (engineRendererSettings.nodeHelperVisibility.value) camera.layers.enable(ObjectLayers.NodeHelper)
    else camera.layers.disable(ObjectLayers.NodeHelper)
  }, [engineRendererSettings.nodeHelperVisibility])

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
