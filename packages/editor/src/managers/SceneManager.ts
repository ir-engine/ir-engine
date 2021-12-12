import i18n from 'i18next'
import {
  Raycaster,
  Vector2,
  Vector3,
  AudioListener,
  PropertyBinding,
  WebGLInfo,
  WebGLRenderer,
  MeshBasicMaterial,
  MeshNormalMaterial,
  Intersection,
  Object3D,
  PerspectiveCamera
} from 'three'
import EditorInfiniteGridHelper from '../classes/EditorInfiniteGridHelper'
import SceneNode from '../nodes/SceneNode'
import ThumbnailRenderer from '../renderer/ThumbnailRenderer'
import { generateImageFileThumbnail, generateVideoFileThumbnail, getCanvasBlob } from '../functions/thumbnails'
import { LoadGLTF } from '@xrengine/engine/src/assets/functions/LoadGLTF'
import EditorEvents from '../constants/EditorEvents'
import { CommandManager } from './CommandManager'
import EditorCommands from '../constants/EditorCommands'
import { getIntersectingNodeOnScreen } from '../functions/getIntersectingNode'
import cloneObject3D from '@xrengine/engine/src/scene/functions/cloneObject3D'
import isEmptyObject from '../functions/isEmptyObject'
import { ControlManager } from './ControlManager'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { GLTFExporter } from '@xrengine/engine/src/assets/loaders/gltf/GLTFExporter'
import { RethrownError } from '@xrengine/client-core/src/util/errors'
import TransformGizmo from '@xrengine/engine/src/scene/classes/TransformGizmo'
import PostProcessingNode from '../nodes/PostProcessingNode'
import { NodeManager } from './NodeManager'
import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { configureEffectComposer } from '@xrengine/engine/src/renderer/functions/configureEffectComposer'
import makeRenderer from '../renderer/makeRenderer'
import { RenderModes, RenderModesType } from '../constants/RenderModes'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { System } from '@xrengine/engine/src/ecs/classes/System'
import { Effects } from '@xrengine/engine/src/scene/classes/PostProcessing'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { createGizmoEntity } from '../functions/createGizmoEntity'
import { createCameraEntity } from '../functions/createCameraEntity'
import { createEntity, removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { createEditorEntity } from '../functions/createEditorEntity'
import { getAllEntitiesWithComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EditorControlComponent } from '../classes/EditorControlComponent'
import { SnapMode } from '@xrengine/engine/src/scene/constants/transformConstants'
import { loadSceneFromJSON } from '@xrengine/engine/src/scene/functions/SceneLoading'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { ObjectLayers } from '@xrengine/engine/src/scene/constants/ObjectLayers'
import { ScenePreviewCameraTagComponent } from '@xrengine/engine/src/scene/components/ScenePreviewCamera'
import { deserializeScenePreviewCamera } from '@xrengine/engine/src/scene/functions/loaders/ScenePreviewCameraFunctions'

export type DefaultExportOptionsType = {
  combineMeshes: boolean
  removeUnusedObjects: boolean
}

export class SceneManager {
  static instance: SceneManager = new SceneManager()

  static DefaultExportOptions: DefaultExportOptionsType = {
    combineMeshes: true,
    removeUnusedObjects: true
  }

  sceneModified: boolean
  audioListener: AudioListener
  grid: EditorInfiniteGridHelper
  raycaster: Raycaster
  raycastTargets: Intersection<Object3D>[] = []
  centerScreenSpace: Vector2
  thumbnailRenderer = new ThumbnailRenderer()
  disableUpdate: boolean
  transformGizmo: TransformGizmo
  gizmoEntity: Entity
  cameraEntity: Entity
  editorEntity: Entity
  postProcessingNode: PostProcessingNode
  onUpdateStats: (info: WebGLInfo) => void
  screenshotRenderer: WebGLRenderer = makeRenderer(1920, 1080)
  renderMode: RenderModesType

  async initializeScene(projectFile: SceneJson): Promise<Error[] | void> {
    this.dispose()

    this.raycaster = new Raycaster()

    this.audioListener = new AudioListener()
    Engine.camera.add(this.audioListener)

    this.centerScreenSpace = new Vector2()
    this.disableUpdate = true

    // Empty existing scene
    if (Engine.scene) {
      Engine.scene.traverse((child: any) => {
        if (child.isNode) {
          child.onRemove()
          if (!NodeManager.instance.remove(child)) {
            throw new Error(i18n.t('editor:errors.removeObject'))
          }
        }

        if (child.geometry) {
          child.geometry.dispose()
        }

        if (child.material) {
          if (child.material.length) {
            for (let i = 0; i < child.material.length; ++i) {
              child.material[i].dispose()
            }
          } else {
            child.material.dispose()
          }
        }
      })

      Engine.scene = null!
    }

    // TODO: - Nayan - initialize as new Scene()
    Engine.scene = new SceneNode() as any

    NodeManager.instance.nodes = [Engine.scene]

    // getting scene data
    loadSceneFromJSON(projectFile)

    Engine.camera.position.set(0, 5, 10)
    Engine.camera.lookAt(new Vector3())

    this.grid = new EditorInfiniteGridHelper()
    this.transformGizmo = new TransformGizmo()

    this.gizmoEntity = createGizmoEntity(this.transformGizmo)
    this.cameraEntity = createCameraEntity()
    this.editorEntity = createEditorEntity()

    Engine.scene.add(Engine.camera)
    Engine.scene.add(this.grid)
    Engine.scene.add(this.transformGizmo)

    this.sceneModified = false

    return []
  }

  /**
   * Function onEmitSceneModified called when scene get modified.
   *
   * @author Robert Long
   */
  onEmitSceneModified() {
    this.sceneModified = true
  }

  /**
   * Function initializeRenderer used to render canvas.
   *
   * @author Robert Long
   * @param  {any} canvas [ contains canvas data ]
   */
  initializeRenderer(): void {
    try {
      this.disableUpdate = false

      Engine.engineTimer.start()
      ControlManager.instance.initControls()

      const editorControlComponent = getComponent(this.editorEntity, EditorControlComponent)
      this.grid.setSize(editorControlComponent.translationSnap)

      configureEffectComposer()
      CommandManager.instance.addListener(EditorEvents.SELECTION_CHANGED.toString(), this.updateOutlinePassSelection)
      window.addEventListener('resize', this.onResize)

      CommandManager.instance.emitEvent(EditorEvents.RENDERER_INITIALIZED)
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Function takeScreenshot used for taking screenshots.
   *
   * @author Robert Long
   * @param  {any}  width
   * @param  {any}  height
   * @return {Promise}        [generated screenshot according to height and width]
   */
  async takeScreenshot(width: number, height: number) {
    const originalRenderer = Engine.renderer
    Engine.renderer = this.screenshotRenderer
    this.disableUpdate = true

    const entities = getAllEntitiesWithComponent(ScenePreviewCameraTagComponent)
    if (!entities.length) return

    let cameraEntity = entities[0]
    let scenePreviewCamera: PerspectiveCamera

    if (!cameraEntity) {
      cameraEntity = createEntity()
      deserializeScenePreviewCamera(cameraEntity, null!)

      scenePreviewCamera = getComponent(cameraEntity, Object3DComponent).value as PerspectiveCamera
      Engine.camera.matrix.decompose(
        scenePreviewCamera.position,
        scenePreviewCamera.quaternion,
        scenePreviewCamera.scale
      )
      // CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_OBJECTS, [scenePreviewCamera])
    } else {
      scenePreviewCamera = getComponent(cameraEntity, Object3DComponent).value as PerspectiveCamera
    }

    const prevAspect = scenePreviewCamera.aspect
    scenePreviewCamera.aspect = width / height
    scenePreviewCamera.updateProjectionMatrix()
    scenePreviewCamera.layers.disable(ObjectLayers.Scene)
    this.screenshotRenderer.setSize(width, height, true)
    this.screenshotRenderer.render(Engine.scene as any, scenePreviewCamera)
    const blob = await getCanvasBlob(this.screenshotRenderer.domElement)
    scenePreviewCamera.aspect = prevAspect
    scenePreviewCamera.updateProjectionMatrix()
    scenePreviewCamera.layers.enable(ObjectLayers.Scene)
    this.disableUpdate = false
    Engine.renderer = originalRenderer
    return blob
  }

  enableShadows(status: boolean): void {
    Engine.renderer.shadowMap.enabled = status
    Engine.scene.traverse((object: any) => {
      if (object.setShadowsEnabled) {
        object.setShadowsEnabled(this.enableShadows)
      }
    })
  }

  changeRenderMode(mode: RenderModesType) {
    this.renderMode = mode

    const passes = Engine.effectComposer?.passes.filter((p) => p.name === 'RenderPass')
    const renderPass = passes ? passes[0] : undefined

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
    CommandManager.instance.emit('resize')
  }

  /**
   * Function getSpawnPosition provides the postion of object inside scene.
   *
   * @author Robert Long
   * @param target
   * @return {any}        [Spwan position]
   */
  getSpawnPosition(target: Vector3) {
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
    CommandManager.instance.executeCommand(EditorCommands.REPARENT, objects, {
      parents: Engine.scene,
      positions: newPosition
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
    const rect = Engine.renderer.domElement.getBoundingClientRect()
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
  getScreenSpaceSpawnPosition(screenSpacePosition: Vector2, target: Vector3) {
    this.raycastTargets.length = 0
    const closestTarget = getIntersectingNodeOnScreen(this.raycaster, screenSpacePosition, this.raycastTargets)

    if (closestTarget && closestTarget.distance < 1000) {
      target.copy(closestTarget.point)
    } else {
      this.raycaster.ray.at(20, target)
    }

    const editorControlComponent = getComponent(this.editorEntity, EditorControlComponent)
    if (editorControlComponent.snapMode === SnapMode.Grid) {
      const translationSnap = editorControlComponent.translationSnap

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
  async exportScene(options = {} as DefaultExportOptionsType) {
    const { combineMeshes, removeUnusedObjects } = Object.assign({}, SceneManager.DefaultExportOptions, options)

    CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, [])

    const scene = Engine.scene

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

  updateOutlinePassSelection(): void {
    if (!Engine.effectComposer || !Engine.effectComposer[Effects.OutlineEffect]) return

    const meshes = [] as any[]
    for (let i = 0; i < CommandManager.instance.selectedTransformRoots.length; i++) {
      const obj3d = getComponent(CommandManager.instance.selectedTransformRoots[i].entity, Object3DComponent).value
      obj3d.traverse((child: any) => {
        if (
          !child.userData.disableOutline &&
          !child.userData.isHelper &&
          (child.isMesh || child.isLine || child.isSprite || child.isPoints)
        ) {
          meshes.push(child)
        }
      })
    }

    Engine.effectComposer[Effects.OutlineEffect].selection.set(meshes)
  }

  dispose() {
    if (this.cameraEntity) removeEntity(this.cameraEntity)
    if (this.gizmoEntity) removeEntity(this.gizmoEntity)
    if (this.editorEntity) removeEntity(this.editorEntity)
    Engine.renderer?.dispose()
    this.screenshotRenderer?.dispose()
    Engine.effectComposer?.dispose()
    CommandManager.instance.removeListener(EditorEvents.SELECTION_CHANGED.toString(), this.updateOutlinePassSelection)
  }
}

type EngineRendererProps = {
  canvas: HTMLCanvasElement
  enabled: boolean
}

// TODO: - Nayan - Probably moved to engine package or will be replaced by already available WebGLRenderSystem
export default async function EditorRendererSystem(world: World, _: EngineRendererProps): Promise<System> {
  // await EngineRenderer.instance.loadGraphicsSettingsFromStorage()
  // EngineRenderer.instance.dispatchSettingsChangeEvent()

  return () => {
    if (!SceneManager.instance.disableUpdate) EngineRenderer.instance.execute(world.delta)
  }
}
