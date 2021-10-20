import {
  MeshBasicMaterial,
  MeshNormalMaterial,
  NearestFilter,
  RGBFormat,
  WebGLInfo,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three'
import { CommandManager } from '../managers/CommandManager'
import EditorCommands from '../constants/EditorCommands'
import { getCanvasBlob } from '../functions/thumbnails'
import PostProcessingNode from '../nodes/PostProcessingNode'
import ScenePreviewCameraNode from '../nodes/ScenePreviewCameraNode'
import makeRenderer from './makeRenderer'
import { SceneManager } from '../managers/SceneManager'
import { EffectComposer as PostProcessingEffectComposer } from 'postprocessing'
import EditorEvents from '../constants/EditorEvents'

import {
  BlendFunction,
  EffectComposer,
  DepthOfFieldEffect,
  OutlineEffect,
  DepthDownsamplingPass,
  EffectPass,
  NormalPass,
  RenderPass,
  SSAOEffect,
  TextureEffect
} from 'postprocessing'
import { effectType } from '@xrengine/engine/src/scene/classes/PostProcessing'
import { RenderModes, RenderModesType } from '../constants/RenderModes'

export default class Renderer {
  canvas: HTMLCanvasElement
  webglRenderer: WebGLRenderer
  renderMode: RenderModesType
  screenshotRenderer: WebGLRenderer
  onUpdateStats: (info: WebGLInfo) => void
  effectComposer: PostProcessingEffectComposer
  outlineEffect: OutlineEffect
  renderPass: RenderPass
  PostProcessingNode: PostProcessingNode

  constructor(canvas) {
    this.canvas = canvas
    const renderer = makeRenderer(
      canvas.parentElement.parentElement.offsetWidth,
      canvas.parentElement.parentElement.offsetHeight,
      {
        canvas
      }
    )
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.info.autoReset = false
    this.webglRenderer = renderer

    this.screenshotRenderer = makeRenderer(1920, 1080)

    /** @todo */
    // Cascaded shadow maps
    // const csm = new CSM({
    //   cascades: 4,
    //   lightIntensity: 1,
    //   shadowMapSize: 2048,
    //   maxFar: 100,
    //   camera: camera,
    //   parent: SceneManager.instance.scene
    // });
    // csm.fade = true;
    // Engine.csm = csm;

    CommandManager.instance.addListener(EditorEvents.SELECTION_CHANGED.toString(), () => {
      if (this.outlineEffect) {
        const meshes = this.filterMeshes(CommandManager.instance.selectedTransformRoots)
        this.outlineEffect.selection.set(meshes)
      }
    })

    this.configureEffectComposer()
  }

  update(dt, _time) {
    this.webglRenderer.info.reset()
    // Engine.csm.update();
    this.effectComposer
      ? this.effectComposer.render(dt)
      : this.webglRenderer.render(SceneManager.instance.scene as any, SceneManager.instance.camera)

    if (this.onUpdateStats) {
      const renderStat = this.webglRenderer.info.render as any
      renderStat.fps = 1 / dt
      renderStat.frameTime = dt * 1000
      this.onUpdateStats(this.webglRenderer.info)
    }
  }

  configureEffectComposer(remove: boolean = false): void {
    if (remove) {
      this.effectComposer = null
      return
    }

    const { scene, camera, postProcessingNode } = SceneManager.instance

    if (!this.effectComposer) this.effectComposer = new EffectComposer(this.webglRenderer)
    else this.effectComposer.removeAllPasses()

    this.renderPass = new RenderPass(scene, camera)
    this.effectComposer.addPass(this.renderPass)

    const normalPass = new NormalPass(scene, camera, {
      renderTarget: new WebGLRenderTarget(1, 1, {
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        format: RGBFormat,
        stencilBuffer: false
      })
    })

    const depthDownsamplingPass = new DepthDownsamplingPass({
      normalBuffer: normalPass.texture,
      resolutionScale: 0.5
    })

    const normalDepthBuffer = depthDownsamplingPass.texture

    const passes: any[] = []

    if (postProcessingNode) {
      Object.keys(postProcessingNode.postProcessingOptions).forEach((key: any) => {
        const pass = postProcessingNode.postProcessingOptions[key]
        const effect = effectType[key].effect

        if (pass.isActive)
          if (effect === SSAOEffect) {
            passes.push(new effect(camera, normalPass.texture, { ...pass, normalDepthBuffer }))
          } else if (effect === DepthOfFieldEffect) passes.push(new effect(camera, pass))
          else if (effect === OutlineEffect) {
            const eff = new effect(scene, camera, pass)
            passes.push(eff)
            this.outlineEffect = eff
          } else passes.push(new effect(pass))
      })
    }

    if (passes.length) {
      const textureEffect = new TextureEffect({
        blendFunction: BlendFunction.SKIP,
        texture: depthDownsamplingPass.texture
      })

      this.effectComposer.addPass(depthDownsamplingPass)
      this.effectComposer.addPass(new EffectPass(camera, ...passes, textureEffect))
    }
  }

  get isShadowMapEnabled() {
    return this.webglRenderer.shadowMap.enabled
  }

  enableShadows(status: boolean): void {
    this.webglRenderer.shadowMap.enabled = status
    SceneManager.instance.scene.traverse((object) => {
      if (object.setShadowsEnabled) {
        object.setShadowsEnabled(this.enableShadows)
      }
    })
  }

  changeRenderMode(mode: RenderModesType) {
    this.renderMode = mode
    switch (mode) {
      case RenderModes.UNLIT:
        this.enableShadows(false)
        this.renderPass.overrideMaterial = null
        break
      case RenderModes.LIT:
        this.enableShadows(false)
        this.renderPass.overrideMaterial = null
        break
      case RenderModes.SHADOW:
        this.enableShadows(true)
        this.renderPass.overrideMaterial = null
        break
      case RenderModes.WIREFRAME:
        this.enableShadows(false)
        this.renderPass.overrideMaterial = new MeshBasicMaterial({
          wireframe: true
        })
        break
      case RenderModes.NORMALS:
        this.enableShadows(false)
        this.renderPass.overrideMaterial = new MeshNormalMaterial()
        break
    }

    CommandManager.instance.emitEvent(EditorEvents.RENDER_MODE_CHANGED)
  }

  onResize = () => {
    const camera = SceneManager.instance.camera
    const canvas = this.canvas
    const containerEl = canvas.parentElement.parentElement
    camera.aspect = containerEl.offsetWidth / containerEl.offsetHeight
    camera.updateProjectionMatrix()
    this.webglRenderer.setSize(containerEl.offsetWidth, containerEl.offsetHeight, false)
    // Engine.csm.updateFrustums();

    this.configureEffectComposer()
  }

  takeScreenshot = async (width = 1920, height = 1080) => {
    const { screenshotRenderer } = this
    const originalRenderer = this.webglRenderer
    this.webglRenderer = screenshotRenderer
    SceneManager.instance.disableUpdate = true
    let scenePreviewCamera = SceneManager.instance.scene.findNodeByType(ScenePreviewCameraNode)
    if (!scenePreviewCamera) {
      scenePreviewCamera = new ScenePreviewCameraNode()
      SceneManager.instance.camera.matrix.decompose(
        scenePreviewCamera.position,
        scenePreviewCamera.rotation,
        scenePreviewCamera.scale
      )
      CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_OBJECTS, [scenePreviewCamera])
    }
    const prevAspect = scenePreviewCamera.aspect
    scenePreviewCamera.aspect = width / height
    scenePreviewCamera.updateProjectionMatrix()
    scenePreviewCamera.layers.disable(1)
    screenshotRenderer.setSize(width, height, true)
    screenshotRenderer.render(SceneManager.instance.scene as any, scenePreviewCamera)
    const blob = await getCanvasBlob(screenshotRenderer.domElement)
    scenePreviewCamera.aspect = prevAspect
    scenePreviewCamera.updateProjectionMatrix()
    scenePreviewCamera.layers.enable(1)
    SceneManager.instance.disableUpdate = false
    this.webglRenderer = originalRenderer
    return blob
  }

  filterMeshes(object: any | any[], meshes: any[] = []): any[] {
    if (Array.isArray(object)) {
      for (let i = 0; i < object.length; i++) {
        this.filterMeshes(object[i], meshes)
      }

      return meshes
    }

    object.traverse((child) => {
      if (
        !child.disableOutline &&
        !child.isHelper &&
        (child.isMesh || child.isLine || child.isSprite || child.isPoints)
      ) {
        meshes.push(child)
      }
    })

    return meshes
  }

  dispose() {
    this.webglRenderer.dispose()
    this.screenshotRenderer.dispose()
    this.effectComposer?.dispose()
  }
}
