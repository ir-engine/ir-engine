import i18n from 'i18next'
import { PerspectiveCamera, Raycaster, Scene, Vector2, Vector3, AudioListener, PropertyBinding, Clock } from 'three'
import EditorInfiniteGridHelper from '../classes/EditorInfiniteGridHelper'
import SceneNode from '../nodes/SceneNode'
import Renderer from '../renderer/Renderer'
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
import resizeShadowCameraFrustum from '../functions/resizeShadowCameraFrustum'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { GLTFExporter } from '@xrengine/engine/src/assets/loaders/gltf/GLTFExporter'
import { RethrownError } from '@xrengine/engine/src/scene/functions/errors'

export class SceneManager {
  static instance: SceneManager

  static DefaultExportOptions = {
    combineMeshes: true,
    removeUnusedObjects: true
  }

  renderer: Renderer
  scene: SceneNode
  sceneModified: boolean
  camera: PerspectiveCamera
  audioListener: AudioListener
  helperScene: Scene
  grid: EditorInfiniteGridHelper
  raycaster: Raycaster
  centerScreenSpace: Vector2
  thumbnailRenderer: ThumbnailRenderer
  animationCallback = null
  disableUpdate: boolean
  clock: Clock
  rafId: number

  static buildSceneManager() {
    this.instance = new SceneManager()
  }

  constructor() {
    this.renderer = null
    this.scene = new SceneNode()
    this.sceneModified = false
    this.raycaster = new Raycaster()

    this.camera = Engine.camera as PerspectiveCamera
    this.helperScene = Engine.scene

    this.audioListener = new AudioListener()
    this.camera.add(this.audioListener)
    this.camera.layers.enable(1)
    this.camera.name = 'Camera'

    this.centerScreenSpace = new Vector2()

    this.grid = new EditorInfiniteGridHelper()
    this.helperScene.add(this.grid as any)

    this.clock = new Clock()
  }

  /**
   * Function onEmitSceneModified called when scene get modified.
   *
   * @author Robert Long
   */
  onEmitSceneModified() {
    this.sceneModified = true
    CommandManager.instance.emitEvent(EditorEvents.SCENE_MODIFIED)
  }

  /**
   * Function initializeRenderer used to render canvas.
   *
   * @author Robert Long
   * @param  {any} canvas [ contains canvas data ]
   */
  initializeRenderer(canvas: HTMLCanvasElement): void {
    try {
      this.renderer = new Renderer(canvas)
      this.thumbnailRenderer = new ThumbnailRenderer()
      window.addEventListener('resize', this.onResize)
      // resolveRenderer()
    } catch (error) {
      // rejectRenderer(error)
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
  async takeScreenshot(width?: number, height?: number): Promise<any> {
    return this.renderer.takeScreenshot(width, height)
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
    SceneManager.instance.renderer.onResize()
    CommandManager.instance.emit('resize')
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
    CommandManager.instance.executeCommand(EditorCommands.REPARENT, objects, {
      parents: this.scene,
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
    const rect = this.renderer.canvas.getBoundingClientRect()
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
    this.raycaster.setFromCamera(screenSpacePosition, this.camera)
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

    const scene = SceneManager.instance.scene

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
  update = () => {
    if (!this.disableUpdate) {
      const delta = this.clock.getDelta()
      const time = this.clock.getElapsedTime()
      this.scene.updateMatrixWorld()
      ControlManager.instance.inputManager.update(delta, time)

      const enableShadows = this.renderer.renderMode.enableShadows

      this.scene.traverse((node) => {
        if (enableShadows && node.isDirectionalLight) {
          resizeShadowCameraFrustum(node, this.scene)
        }

        if (node.isNode) {
          node.onUpdate(delta, time)
        }
      })
      ControlManager.instance.flyControls.update(delta)
      ControlManager.instance.editorControls.update()

      if (this.animationCallback) {
        this.animationCallback()
      }

      this.renderer.update(delta, time)
      ControlManager.instance.inputManager.reset()
    }

    this.rafId = requestAnimationFrame(this.update)
  }
}
