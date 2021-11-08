import i18n from 'i18next'
import {
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  AudioListener,
  PropertyBinding,
  WebGLInfo,
  WebGLRenderer,
  MeshBasicMaterial,
  MeshNormalMaterial
} from 'three'
import EditorInfiniteGridHelper from '../classes/EditorInfiniteGridHelper'
import ThumbnailRenderer from '../renderer/ThumbnailRenderer'
import { generateImageFileThumbnail, generateVideoFileThumbnail } from '../functions/thumbnails'
import { LoadGLTF } from '@xrengine/engine/src/assets/functions/LoadGLTF'
import EditorEvents from '../constants/EditorEvents'
import { CommandManager } from './CommandManager'
import EditorCommands from '../constants/EditorCommands'
import getIntersectingNode from '../functions/getIntersectingNode'
import cloneObject3D from '@xrengine/engine/src/scene/functions/cloneObject3D'
import isEmptyObject from '../functions/isEmptyObject'
import { ControlManager } from './ControlManager'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { GLTFExporter } from '@xrengine/engine/src/assets/loaders/gltf/GLTFExporter'
import { RethrownError } from '@xrengine/client-core/src/util/errors'
import TransformGizmo from '@xrengine/engine/src/scene/classes/TransformGizmo'
import PostProcessingNode from '../nodes/PostProcessingNode'
import { WorldScene } from '@xrengine/engine/src/scene/functions/SceneLoading'
import { configureEffectComposer } from '@xrengine/engine/src/renderer/functions/configureEffectComposer'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { getAllComponentsOfType, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { Effects } from '@xrengine/engine/src/scene/classes/PostProcessing'
import { PostProcessingComponent } from '@xrengine/engine/src/scene/components/PostProcessingComponent'
import { getCanvasBlob } from '../functions/thumbnails'
import ScenePreviewCameraNode from '../nodes/ScenePreviewCameraNode'
import makeRenderer from '../renderer/makeRenderer'
import { RenderModes, RenderModesType } from '../constants/RenderModes'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { System } from '@xrengine/engine/src/ecs/classes/System'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { TransformSpace } from '../constants/TransformSpace'
import { NodeManager } from './NodeManager'
import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { accessEditorState } from '../services/EditorServices'

export class SceneManager {
  static instance: SceneManager = new SceneManager()

  static DefaultExportOptions = {
    combineMeshes: true,
    removeUnusedObjects: true
  }

  scene: Scene
  sceneModified: boolean
  audioListener: AudioListener
  grid: EditorInfiniteGridHelper
  raycaster: Raycaster
  centerScreenSpace: Vector2
  thumbnailRenderer: ThumbnailRenderer
  disableUpdate: boolean
  rafId: number
  transformGizmo: TransformGizmo
  postProcessingNode: PostProcessingNode
  canvas: HTMLCanvasElement
  onUpdateStats: (info: WebGLInfo) => void
  screenshotRenderer: WebGLRenderer
  renderMode: RenderModesType

  static buildSceneManager() {
    this.instance = new SceneManager()
  }

  constructor() {
    this.sceneModified = false
    this.raycaster = new Raycaster()

    this.centerScreenSpace = new Vector2()
    this.disableUpdate = true

    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.INITIALIZED_ENGINE, this.initEffectComposer)
    CommandManager.instance.addListener(EditorEvents.SELECTION_CHANGED.toString(), this.updateOutlinePassSelection)
  }

  async initializeScene(projectFile: SceneJson): Promise<Error[] | void> {
    this.disableUpdate = true

    // remove existing scene
    if (this.scene) {
      CommandManager.instance.executeCommand(EditorCommands.REMOVE_OBJECTS, this.scene)
    }

    NodeManager.instance.nodes = [this.scene]

    // getting scene data
    // const [scene, error] = await SceneNode.loadProject(projectFile)

    await WorldScene.load(projectFile, null, { generateEntityTree: true, isEditor: true })
    // if (scene === null) throw new Error('Scene data is null, please create a new scene.')

    this.scene = Engine.scene

    this.grid = new EditorInfiniteGridHelper()
    this.transformGizmo = new TransformGizmo()

    this.sceneModified = false

    Engine.camera = Engine.camera as PerspectiveCamera

    this.scene.add(this.grid)
    this.scene.add(this.transformGizmo)

    this.audioListener = new AudioListener()
    Engine.camera.add(this.audioListener)
    Engine.camera.layers.enable(1)
    Engine.camera.name = 'Camera'

    Engine.camera.position.set(0, 5, 10)
    Engine.camera.lookAt(new Vector3())

    this.scene.add(Engine.camera)

    this.thumbnailRenderer = new ThumbnailRenderer()
    window.addEventListener('resize', this.onResize)

    ControlManager.instance.initControls()
    this.grid.setSize(ControlManager.instance.editorControls.translationSnap)

    this.disableUpdate = false
    CommandManager.instance.emitEvent(EditorEvents.RENDERER_INITIALIZED)
  }

  /**
   * Function onEmitSceneModified called when scene get modified.
   *
   * @author Robert Long
   */
  onEmitSceneModified() {
    this.sceneModified = true
  }

  createRenderer(canvas: HTMLCanvasElement): void {
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
  }

  initEffectComposer() {
    configureEffectComposer()
    EngineEvents.instance.removeEventListener(EngineEvents.EVENTS.INITIALIZED_ENGINE, this.initEffectComposer)
  }

  /**
   * Function takeScreenshot used for taking screenshots.
   *
   * @author Robert Long
   * @param  {any}  width
   * @param  {any}  height
   * @return {Promise}        [generated screenshot according to height and width]
   */
  async takeScreenshot(width?: number, height?: number): Promise<any> {
    const { screenshotRenderer } = this
    const originalRenderer = Engine.renderer
    Engine.renderer = screenshotRenderer
    SceneManager.instance.disableUpdate = true
    let scenePreviewCamera = Engine.scene.findNodeByType(ScenePreviewCameraNode)
    if (!scenePreviewCamera) {
      scenePreviewCamera = new ScenePreviewCameraNode()
      Engine.camera.matrix.decompose(scenePreviewCamera.position, scenePreviewCamera.rotation, scenePreviewCamera.scale)
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
    Engine.renderer = originalRenderer
    return blob
  }

  /**
   * Function generateFileThumbnail used to create thumbnail from audio as well video file.
   *
   * @author Robert Long
   * @param  {any}  file
   * @param  {any}  width
   * @param  {any}  height
   * @return {Promise}        [generated thumbnail data as blob]
   */
  async generateFileThumbnail(file, width?: number, height?: number): Promise<any> {
    const url = URL.createObjectURL(file)

    let blob

    const fileName = file.name.toLowerCase()
    if (fileName.endsWith('.glb')) {
      const { scene } = await LoadGLTF(url)

      blob = await this.thumbnailRenderer.generateThumbnail(scene, width, height)
    } else if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].some((ext) => fileName.endsWith(ext))) {
      blob = await generateImageFileThumbnail(file)
    } else if (file.name.toLowerCase().endsWith('.mp4')) {
      blob = await generateVideoFileThumbnail(file)
    }

    URL.revokeObjectURL(url)

    if (!blob) {
      throw new Error(i18n.t('editor:errors.fileTypeNotSupported', { name: file.name }))
    }
    return blob
  }

  /**
   * Function onResize event handler for resize containers.
   *
   * @author Robert Long
   */
  onResize = () => {
    ControlManager.instance.inputManager.onResize()
    const camera = Engine.camera as PerspectiveCamera
    const canvas = this.canvas
    const containerEl = canvas.parentElement.parentElement
    camera.aspect = containerEl.offsetWidth / containerEl.offsetHeight

    camera.updateProjectionMatrix()
    Engine.renderer.setSize(containerEl.offsetWidth, containerEl.offsetHeight, false)
    // Engine.csm.updateFrustums();

    configureEffectComposer()
    CommandManager.instance.emit('resize')
  }

  updateOutlinePassSelection(): any[] {
    const components = getAllComponentsOfType(PostProcessingComponent)
    if (!Array.isArray(components) || components.length <= 0) return

    const postProcessingComponent = components[0]
    if (!postProcessingComponent[Effects.OutlineEffect] || !postProcessingComponent[Effects.OutlineEffect].effect) {
      return
    }

    const meshes = []
    for (let i = 0; i < CommandManager.instance.selectedTransformRoots.length; i++) {
      const entityNode = CommandManager.instance.selectedTransformRoots[i]
      const object3dComponent = getComponent(entityNode.eid, Object3DComponent)

      object3dComponent.value.traverse((child: any) => {
        if (
          !child.disableOutline &&
          !child.isHelper &&
          (child.isMesh || child.isLine || child.isSprite || child.isPoints)
        ) {
          meshes.push(child)
        }
      })
    }

    postProcessingComponent[Effects.OutlineEffect].effect.selection.set(meshes)

    return meshes
  }

  /**
   * Function getSpawnPosition provides the postion of object inside scene.
   *
   * @author Robert Long
   * @param target
   * @return {any}        [Spwan position]
   */
  getSpawnPosition(target) {
    return this.getScreenSpaceSpawnPosition(this.centerScreenSpace, target)
  }

  /**
   * Function reparentToSceneAtCursorPosition used to reparent scene at cursor position.
   *
   * @author Robert Long
   * @param objects
   * @param mousePos
   */
  reparentToSceneAtCursorPosition(objects, mousePos) {
    const newPosition = new Vector3()
    this.getCursorSpawnPosition(mousePos, newPosition)
    const world = useWorld()
    CommandManager.instance.executeCommand(EditorCommands.REPARENT, objects, { parents: world.entityTree.rootNode })
    CommandManager.instance.executeCommand(EditorCommands.POSITION, objects, {
      positions: newPosition,
      space: TransformSpace.Local
    })
  }

  /**
   * Function provides the cursor spawn position.
   *
   * @author Robert Long
   * @param mousePos
   * @param target
   * @returns
   */
  getCursorSpawnPosition(mousePos, target) {
    const rect = this.canvas.getBoundingClientRect()
    const position = new Vector2()
    position.x = ((mousePos.x - rect.left) / rect.width) * 2 - 1
    position.y = ((mousePos.y - rect.top) / rect.height) * -2 + 1
    return this.getScreenSpaceSpawnPosition(position, target)
  }

  /**
   * Function provides the screen space spawn position.
   *
   * @author Robert Long
   * @param screenSpacePosition
   * @param target
   */
  getScreenSpaceSpawnPosition(screenSpacePosition, target) {
    this.raycaster.setFromCamera(screenSpacePosition, Engine.camera)
    const results = this.raycaster.intersectObject(this.scene as any, true)
    const result = getIntersectingNode(results, this.scene)

    if (result && result.distance < 1000) {
      target.copy(result.point)
    } else {
      this.raycaster.ray.at(20, target)
    }

    if (ControlManager.instance.editorControls.shouldSnap()) {
      const translationSnap = ControlManager.instance.editorControls.translationSnap

      target.set(
        Math.round(target.x / translationSnap) * translationSnap,
        Math.round(target.y / translationSnap) * translationSnap,
        Math.round(target.z / translationSnap) * translationSnap
      )
    }
  }

  /**
   * Function exportScene used to export scene.
   *
   * @author Robert Long
   * @param  {any}  signal       [show the Network status]
   * @param  {Object}  [options={}]
   * @return {Promise}              [scene data as object]
   */
  async exportScene(options = {}) {
    const { combineMeshes, removeUnusedObjects } = Object.assign({}, SceneManager.DefaultExportOptions, options)

    CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, [])

    const scene = this.scene

    const clonedScene = cloneObject3D(scene, true)
    const animations = clonedScene.getAnimationClips()

    for (const clip of animations) {
      for (const track of clip.tracks) {
        const { nodeName: uuid } = PropertyBinding.parseTrackName(track.name)

        const object = clonedScene.getObjectByProperty('uuid', uuid)

        if (!object) {
          const originalSceneObject = scene.getObjectByProperty('uuid', uuid)

          if (originalSceneObject) {
            console.log(`Couldn't find object with uuid: "${uuid}" in cloned scene but was found in original scene!`)
          } else {
            console.log(`Couldn't find object with uuid: "${uuid}" in cloned or original scene!`)
          }
        }
      }
    }

    const exportContext = { animations }

    clonedScene.prepareForExport(exportContext)

    if (combineMeshes) {
      await clonedScene.combineMeshes()
    }

    if (removeUnusedObjects) {
      clonedScene.removeUnusedObjects()
    }

    const exporter = new GLTFExporter({
      mode: 'glb',
      onlyVisible: false,
      includeCustomExtensions: true,
      animations
    })

    let chunks

    try {
      chunks = await exporter.exportChunks(clonedScene)
    } catch (error) {
      throw new RethrownError(`Error exporting scene`, error)
    }

    const json = chunks.json

    const nodeDefs = json.nodes
    if (nodeDefs) {
      const uuidToIndexMap = {}

      for (let i = 0; i < nodeDefs.length; i++) {
        const nodeDef = nodeDefs[i]

        if (nodeDef.extras && nodeDef.extras.editor_uuid) {
          uuidToIndexMap[nodeDef.extras.editor_uuid] = i
          delete nodeDef.extras.editor_uuid

          if (isEmptyObject(nodeDef.extras)) {
            delete nodeDef.extras
          }
        }
      }
    }

    try {
      const glbBlob = await exporter.exportGLBBlob(chunks)

      return { glbBlob, chunks }
    } catch (error) {
      throw new RethrownError('Error creating glb blob', error)
    }
  }

  /**
   * Function update used to update components used in editor.
   *
   * @author Robert Long
   */
  update = (delta: number, time: number) => {
    if (!this.disableUpdate) {
      this.scene.updateMatrixWorld()
      ControlManager.instance.inputManager.update(delta, time)

      // this.scene.traverse((node) => {
      //   if (Engine.renderer.shadowMap.enabled && node.isDirectionalLight) {
      //     resizeShadowCameraFrustum(node, this.scene)
      //   }

      //   // if (node.isNode) {
      //   //   node.onUpdate?(delta, time)
      //   // }
      // })

      ControlManager.instance.flyControls.update(delta)
      ControlManager.instance.editorControls.update()

      Engine.renderer.info.reset()
      // Engine.csm.update();
      Engine.effectComposer
        ? Engine.effectComposer.render(delta)
        : Engine.renderer.render(Engine.scene as any, Engine.camera)

      if (this.onUpdateStats) {
        const renderStat = Engine.renderer.info.render as any
        renderStat.fps = 1 / delta
        renderStat.frameTime = delta * 1000
        this.onUpdateStats(Engine.renderer.info)
      }

      ControlManager.instance.inputManager.reset()
    }
  }

  enableShadows(status: boolean): void {
    Engine.renderer.shadowMap.enabled = status
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

  dispose() {
    Engine.renderer.dispose()
    this.screenshotRenderer.dispose()
    Engine.effectComposer?.dispose()
    CommandManager.instance.removeListener(EditorEvents.SELECTION_CHANGED.toString(), this.updateOutlinePassSelection)
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
