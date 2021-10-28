import {
  MeshBasicMaterial,
  MeshNormalMaterial,
  WebGLInfo,
  WebGLRenderer,
} from 'three'
import { CommandManager } from '../managers/CommandManager'
import EditorCommands from '../constants/EditorCommands'
import { getCanvasBlob } from '../functions/thumbnails'
import PostProcessingNode from '../nodes/PostProcessingNode'
import ScenePreviewCameraNode from '../nodes/ScenePreviewCameraNode'
import makeRenderer from './makeRenderer'
import { SceneManager } from '../managers/SceneManager'
import EditorEvents from '../constants/EditorEvents'
import { RenderModes, RenderModesType } from '../constants/RenderModes'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { System } from '@xrengine/engine/src/ecs/classes/System'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'
import { configureEffectComposer } from '@xrengine/engine/src/renderer/functions/configureEffectComposer'
import { Effects } from '@xrengine/engine/src/scene/classes/PostProcessing'
import { getAllComponentsOfType } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { PostProcessingComponent } from '@xrengine/engine/src/scene/components/PostProcessingComponent'

export class Renderer {
  canvas: HTMLCanvasElement
  webglRenderer: WebGLRenderer
  renderMode: RenderModesType
  screenshotRenderer: WebGLRenderer
  onUpdateStats: (info: WebGLInfo) => void
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
    Engine.renderer = renderer

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
      const components = getAllComponentsOfType(PostProcessingComponent)
      if (!Array.isArray(components) || components.length <= 0) return
      const postProcessingComponent = components[0]

      if (postProcessingComponent[Effects.OutlineEffect] && postProcessingComponent[Effects.OutlineEffect].effect) {
        const meshes = this.filterMeshes(CommandManager.instance.selectedTransformRoots)
        postProcessingComponent[Effects.OutlineEffect].effect.selection.set(meshes)
      }
    })
  }

  update(dt, _time) {
    this.webglRenderer.info.reset()
    // Engine.csm.update();
    Engine.effectComposer
      ? Engine.effectComposer.render(dt)
      : this.webglRenderer.render(SceneManager.instance.scene as any, SceneManager.instance.camera)

    if (this.onUpdateStats) {
      const renderStat = this.webglRenderer.info.render as any
      renderStat.fps = 1 / dt
      renderStat.frameTime = dt * 1000
      this.onUpdateStats(this.webglRenderer.info)
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
    const renderPass = Engine.effectComposer.passes[0]

    if (!renderPass) return

    switch (mode) {
      case RenderModes.UNLIT:
        this.enableShadows(false)
        renderPass.overrideMaterial = null
        break
      case RenderModes.LIT:
        this.enableShadows(false)
        renderPass.overrideMaterial = null
        break
      case RenderModes.SHADOW:
        this.enableShadows(true)
        renderPass.overrideMaterial = null
        break
      case RenderModes.WIREFRAME:
        this.enableShadows(false)
        renderPass.overrideMaterial = new MeshBasicMaterial({
          wireframe: true
        })
        break
      case RenderModes.NORMALS:
        this.enableShadows(false)
        renderPass.overrideMaterial = new MeshNormalMaterial()
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

    configureEffectComposer()
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
    Engine.effectComposer?.dispose()
  }
}

type EngineRendererProps = {
  canvas: HTMLCanvasElement
  enabled: boolean
}


// TODO: Probably moved to engine package or will be replaced by already available WebGLRenderSystem
export default async function EditorRendererSystem(world: World, props: EngineRendererProps): Promise<System> {
  new EngineRenderer(props)

  // await EngineRenderer.instance.loadGraphicsSettingsFromStorage()
  // EngineRenderer.instance.dispatchSettingsChangeEvent()

  return () => {
    if (props.enabled) SceneManager.instance.update(world.delta, world.elapsedTime)
  }
}
