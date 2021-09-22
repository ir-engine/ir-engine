import { Color, Layers, MeshBasicMaterial, MeshNormalMaterial, Vector2 } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader'
import { CommandManager } from '../managers/CommandManager'
import EditorCommands from '../constants/EditorCommands'
import { getCanvasBlob } from '../functions/thumbnails'
import PostProcessingNode from '../nodes/PostProcessingNode'
import ScenePreviewCameraNode from '../nodes/ScenePreviewCameraNode'
import makeRenderer from './makeRenderer'
import OutlinePass from './OutlinePass'
import configurePostProcessing from './RendererPostProcessing'
import { SceneManager } from '../managers/SceneManager'
/**
 * @author mrdoob / http://mrdoob.com/
 */
class RenderMode {
  name: string
  renderer: any
  passes: any[]
  enableShadows: boolean
  constructor(renderer) {
    this.name = 'Default'
    this.renderer = renderer
    this.passes = []
    this.enableShadows = false
  }
  render(dt?) {}
}
class UnlitRenderMode extends RenderMode {
  effectComposer: EffectComposer
  renderPass: RenderPass
  renderHelpersPass: RenderPass
  outlinePass: any
  gammaCorrectionPass: ShaderPass
  enabledBatchedObjectLayers: Layers
  disabledBatchedObjectLayers: Layers
  hiddenLayers: Layers
  disableBatching: boolean
  editorRenderer: any
  constructor(renderer, editorRenderer) {
    super(renderer)
    this.name = 'Unlit'
    this.effectComposer = new EffectComposer(renderer)
    this.renderPass = new RenderPass(SceneManager.instance.scene, SceneManager.instance.camera)
    this.effectComposer.addPass(this.renderPass)
    this.renderHelpersPass = new RenderPass(SceneManager.instance.helperScene, SceneManager.instance.camera)
    this.renderHelpersPass.clear = false
    this.effectComposer.addPass(this.renderHelpersPass)
    const canvasParent = renderer.domElement.parentElement
    this.outlinePass = new OutlinePass(
      new Vector2(canvasParent.offsetWidth, canvasParent.offsetHeight),
      SceneManager.instance.scene,
      SceneManager.instance.camera,
      CommandManager.instance.selectedTransformRoots,
      editorRenderer
    ) as any
    this.gammaCorrectionPass = new ShaderPass(GammaCorrectionShader)
    this.effectComposer.addPass(this.gammaCorrectionPass)
    this.outlinePass.edgeColor = new Color('#006EFF')
    this.outlinePass.renderToScreen = true
    this.effectComposer.addPass(this.outlinePass)
    this.enableShadows = false
    this.enabledBatchedObjectLayers = new Layers()
    this.disabledBatchedObjectLayers = new Layers()
    this.disabledBatchedObjectLayers.disable(0)
    this.disabledBatchedObjectLayers.enable(2)
    this.hiddenLayers = new Layers()
    this.hiddenLayers.set(1)
    this.disableBatching = false
    this.editorRenderer = editorRenderer
  }
  onSceneSet() {
    this.renderer.shadowMap.enabled = this.enableShadows
    SceneManager.instance.scene.traverse((object) => {
      if (object.setShadowsEnabled) {
        object.setShadowsEnabled(this.enableShadows)
      }
      if (
        this.disableBatching &&
        object.isMesh &&
        !object.layers.test(this.enabledBatchedObjectLayers) &&
        !object.layers.test(this.hiddenLayers)
      ) {
        object.layers.enable(0)
        object.layers.enable(2)
      } else if (
        !this.disableBatching &&
        object.isMesh &&
        object.layers.test(this.disabledBatchedObjectLayers) &&
        !object.layers.test(this.hiddenLayers)
      ) {
        object.layers.disable(0)
        object.layers.disable(2)
      }
    })
    this.renderPass.scene = SceneManager.instance.scene
    this.renderPass.camera = SceneManager.instance.camera
    this.outlinePass.renderScene = SceneManager.instance.scene
    this.outlinePass.renderCamera = SceneManager.instance.camera
  }
  onResize() {
    const canvasParent = this.renderer.domElement.parentElement
    this.renderer.setSize(canvasParent.offsetWidth, canvasParent.offsetHeight, false)
  }
  render(dt) {
    this.effectComposer.render(dt)
  }
}
class LitRenderMode extends UnlitRenderMode {
  constructor(renderer, editorRenderer) {
    super(renderer, editorRenderer)
    this.name = 'Lit'
    this.enableShadows = false
    this.disableBatching = true
  }
}
class ShadowsRenderMode extends UnlitRenderMode {
  constructor(renderer, editorRenderer) {
    super(renderer, editorRenderer)
    this.name = 'Shadows'
    this.disableBatching = true
    this.enableShadows = true
  }
}
class WireframeRenderMode extends UnlitRenderMode {
  constructor(renderer, editorRenderer) {
    super(renderer, editorRenderer)
    this.name = 'Wireframe'
    this.enableShadows = false
    this.disableBatching = true
    this.renderPass.overrideMaterial = new MeshBasicMaterial({
      wireframe: true
    })
  }
}
class NormalsRenderMode extends UnlitRenderMode {
  constructor(renderer, editorRenderer) {
    super(renderer, editorRenderer)
    this.name = 'Normals'
    this.enableShadows = false
    this.disableBatching = true
    this.renderPass.overrideMaterial = new MeshNormalMaterial()
  }
}
export default class Renderer {
  canvas: any
  renderer: any
  renderMode: LitRenderMode
  shadowsRenderMode: ShadowsRenderMode
  renderModes: any[]
  screenshotRenderer: any
  camera: any
  onUpdateStats: any
  willusePostProcessing: boolean
  composer: any
  node: any

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
    this.renderer = renderer
    this.renderMode = new LitRenderMode(renderer, this)
    this.shadowsRenderMode = new ShadowsRenderMode(renderer, this)
    this.renderModes = []
    if (this.renderer.capabilities.isWebGL2) {
      this.renderModes.push(new UnlitRenderMode(renderer, this))
    }
    this.renderModes.push(
      this.renderMode,
      this.shadowsRenderMode,
      new WireframeRenderMode(renderer, this),
      new NormalsRenderMode(renderer, this)
    )
    this.screenshotRenderer = makeRenderer(1920, 1080)
    const camera = SceneManager.instance.camera
    this.camera = camera
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
    this.willusePostProcessing = false
    PostProcessingNode.postProcessingCallback = (node, isRemoved = false) => {
      this.node = node
      this.composer = configurePostProcessing(node, this.renderMode.renderPass.scene, camera, renderer, isRemoved)
      this.willusePostProcessing = this.composer !== null
    }
  }
  update(dt, _time) {
    this.renderer.info.reset()
    // Engine.csm.update();
    if (this.willusePostProcessing) this.composer.render(dt)
    else this.renderMode.render(dt)
    if (this.onUpdateStats) {
      this.renderer.info.render.fps = 1 / dt
      this.renderer.info.render.frameTime = dt * 1000
      this.onUpdateStats(this.renderer.info)
    }
  }
  setRenderMode(mode) {
    this.renderMode = mode
    this.renderMode.onSceneSet()
    this.renderMode.onResize()
  }
  onSceneSet = () => {
    this.renderMode.onSceneSet()
  }
  addBatchedObject(object) {
    console.log('Not handling batched object')
  }
  removeBatchedObject(object) {
    console.log('Not handling batched object')
  }
  onResize = () => {
    const camera = this.camera
    const canvas = this.canvas
    const containerEl = canvas.parentElement.parentElement
    camera.aspect = containerEl.offsetWidth / containerEl.offsetHeight
    camera.updateProjectionMatrix()
    this.renderer.setSize(containerEl.offsetWidth, containerEl.offsetHeight, false)
    // Engine.csm.updateFrustums();
    this.renderMode.onResize()

    if (this.willusePostProcessing) {
      PostProcessingNode.postProcessingCallback(this.node)
    }
  }
  takeScreenshot = async (width = 1920, height = 1080) => {
    console.log('Taking screenshot')
    const { screenshotRenderer, camera } = this
    const originalRenderer = this.renderer
    this.renderer = screenshotRenderer
    SceneManager.instance.disableUpdate = true
    let scenePreviewCamera = SceneManager.instance.scene.findNodeByType(ScenePreviewCameraNode)
    if (!scenePreviewCamera) {
      scenePreviewCamera = new ScenePreviewCameraNode()
      camera.matrix.decompose(scenePreviewCamera.position, scenePreviewCamera.rotation, scenePreviewCamera.scale)
      CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_OBJECTS, [scenePreviewCamera])
    }
    const prevAspect = scenePreviewCamera.aspect
    scenePreviewCamera.aspect = width / height
    scenePreviewCamera.updateProjectionMatrix()
    scenePreviewCamera.layers.disable(1)
    screenshotRenderer.setSize(width, height, true)
    SceneManager.instance.scene.traverse((child) => {
      if (child.isNode) {
        child.onRendererChanged()
      }
    })
    if (this.renderMode !== this.shadowsRenderMode) {
      this.shadowsRenderMode.onSceneSet()
    }
    screenshotRenderer.render(SceneManager.instance.scene, scenePreviewCamera)
    const blob = await getCanvasBlob(screenshotRenderer.domElement)
    scenePreviewCamera.aspect = prevAspect
    scenePreviewCamera.updateProjectionMatrix()
    scenePreviewCamera.layers.enable(1)
    SceneManager.instance.disableUpdate = false
    this.renderer = originalRenderer
    this.renderMode.onSceneSet()
    SceneManager.instance.scene.traverse((child) => {
      if (child.isNode) {
        child.onRendererChanged()
      }
    })
    console.log('Returning blob')
    console.log(blob)
    return blob
  }
  dispose() {
    this.renderer.dispose()
    this.screenshotRenderer.dispose()
    this.composer?.dispose()
  }
}
