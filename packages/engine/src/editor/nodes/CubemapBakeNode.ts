/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */

import {
  BoxBufferGeometry,
  BoxHelper,
  Mesh,
  MeshPhysicalMaterial,
  Object3D,
  Quaternion,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLCubeRenderTarget,
  WebGLRenderTarget
} from 'three'
import EditorNodeMixin from './EditorNodeMixin'
import { envmapPhysicalParsReplace, worldposReplace } from './helper/BPCEMShader'
import CubemapCapturer from './helper/CubemapCapturer'
import { convertCubemapToEquiImageData, downloadImage, uploadCubemap } from './helper/ImageUtils'
import SkyboxNode from './SkyboxNode'

export enum CubemapBakeTypes {
  'Realtime',
  'Baked'
}

export enum CubemapBakeRefreshTypes {
  'OnAwake',
  'EveryFrame'
}

export type CubemapBakeSettings = {
  bakePosition: Vector3
  bakePositionOffset?: Vector3
  bakeScale?: Vector3
  bakeType: CubemapBakeTypes
  resolution: number
  refreshMode: CubemapBakeRefreshTypes
  envMapOrigin: string
  boxProjection: boolean
}

export default class CubemapBakeNode extends EditorNodeMixin(Object3D) {
  static nodeName = 'Cubemap Bake'
  static legacyComponentName = 'cubemapbake'
  static haveStaticTags = false
  gizmo: BoxHelper
  cubemapBakeSettings: CubemapBakeSettings
  centerBall: Mesh
  currentEnvMap: WebGLCubeRenderTarget
  ownedFileIdentifier: string

  constructor(editor) {
    super(editor)
    this.centerBall = new Mesh(new SphereGeometry(0.75))
    this.add(this.centerBall)
    this.cubemapBakeSettings = {
      bakePosition: this.position,
      bakePositionOffset: new Vector3(0),
      bakeScale: new Vector3(1, 1, 1),
      bakeType: CubemapBakeTypes.Baked,
      resolution: 512,
      refreshMode: CubemapBakeRefreshTypes.OnAwake,
      envMapOrigin: '',
      boxProjection: true
    }
    this.gizmo = new BoxHelper(new Mesh(new BoxBufferGeometry()), 0xff0000)
    this.centerBall.material = new MeshPhysicalMaterial({
      roughness: 0,
      metalness: 1
    })
    this.add(this.gizmo)
    this.ownedFileIdentifier = 'envMapOwnedFileId'
    this.editor.scene.registerEnvironmentMapNode(this)
  }

  static canAddNode(editor) {
    return editor.scene.findNodeByType(CubemapBakeNode) === null
  }

  async captureCubeMap(): Promise<WebGLCubeRenderTarget> {
    const sceneToBake = this.getSceneForBaking(this.editor.scene)
    const cubemapCapturer = new CubemapCapturer(
      this.editor.renderer.renderer,
      sceneToBake,
      this.cubemapBakeSettings.resolution
    )
    const result = cubemapCapturer.update(this.position)
    const imageData = (await convertCubemapToEquiImageData(this.editor.renderer.renderer, result, 512, 512, false))
      .imageData
    // downloadImage(imageData, 'Hello', 512, 512)
    this.currentEnvMap = result
    this.injectShader()
    this.editor.scene.setUpEnvironmentMap()
    return result
  }

  async Bake(projectId): Promise<WebGLCubeRenderTarget> {
    const rt = await this.captureCubeMap()
    await this.uploadBakeToServer(projectId, rt)
    return rt
  }

  onChange() {
    this.gizmo.matrix.compose(
      this.cubemapBakeSettings.bakePositionOffset,
      new Quaternion(0),
      this.cubemapBakeSettings.bakeScale
    )
    //this.editor.scene.environment=this.visible?this.currentEnvMap?.texture:null;
  }

  injectShader() {
    this.editor.scene.traverse((child) => {
      if (child.material) {
        child.material.onBeforeCompile = (shader) => {
          shader.uniforms.cubeMapSize = { value: this.cubemapBakeSettings.bakeScale }
          shader.uniforms.cubeMapPos = { value: this.cubemapBakeSettings.bakePositionOffset }
          shader.vertexShader = 'varying vec3 vBPCEMWorldPosition;\n' + shader.vertexShader
          shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', worldposReplace)
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <envmap_physical_pars_fragment>',
            envmapPhysicalParsReplace
          )
        }
      }
    })
  }

  async serialize(projectID) {
    let data: any = {}
    await this.Bake(projectID)
    this.cubemapBakeSettings.bakePosition = this.position
    data = {
      options: this.cubemapBakeSettings
    }

    return await super.serialize(projectID, { cubemapbake: data })
  }

  static async deserialize(editor, json) {
    const node = await super.deserialize(editor, json)
    const bakeOptions = json.components.find((c) => c.name === 'cubemapbake')
    const { options } = bakeOptions.props
    if (options) {
      node.cubemapBakeSettings = options as CubemapBakeSettings
      let v = (node.cubemapBakeSettings as CubemapBakeSettings).bakeScale
      ;(node.cubemapBakeSettings as CubemapBakeSettings).bakeScale = new Vector3(v.x, v.y, v.z)
      v = (node.cubemapBakeSettings as CubemapBakeSettings).bakePositionOffset
      ;(node.cubemapBakeSettings as CubemapBakeSettings).bakePositionOffset = new Vector3(v.x, v.y, v.z)
      v = (node.cubemapBakeSettings as CubemapBakeSettings).bakePosition
      ;(node.cubemapBakeSettings as CubemapBakeSettings).bakePosition = new Vector3(v.x, v.y, v.z)
    }
    return node
  }

  prepareForExport() {
    this.replaceObject()
  }

  getCubemapBakeProperties() {
    this.cubemapBakeSettings.bakePosition = this.position
    return this.cubemapBakeSettings
  }

  getSceneForBaking(scene: Scene) {
    const sceneToBake = new Scene()
    scene.traverse((obj) => {
      if (obj['includeInCubemapBake']) {
        const o = obj.clone()
        o.traverse((child) => {
          //disable specular highlights
          ;(child as any).material && ((child as any).material.roughness = 1)
          if ((child as any).isNode) {
            if (child.constructor === SkyboxNode) sceneToBake.background = this.editor.scene.background
          }
        })
        sceneToBake.add(o)
      }
    })
    return sceneToBake
  }

  onRemove() {
    this.currentEnvMap?.dispose()
    this.editor.scene.unregisterEnvironmentMapNode(this)
    const api = this.editor.api
    const fileID = api.filesToUpload[this.ownedFileIdentifier]
    if (fileID) {
      const id = fileID['file_id']
      if (id) api.deleteAsset(id, api.currentProjectID, this.ownedFileIdentifier)
      delete api.filesToUpload[this.ownedFileIdentifier]
    }
  }

  async uploadBakeToServer(projectID: any, rt: WebGLCubeRenderTarget) {
    const value = await uploadCubemap(
      this.editor.renderer.renderer,
      this.editor.api,
      rt,
      this.cubemapBakeSettings.resolution,
      this.ownedFileIdentifier,
      projectID
    )
    console.log('uploadBakeToServer', value)
    this.cubemapBakeSettings.envMapOrigin = value.origin
    const {
      file_id: fileId,
      meta: { access_token: fileToken }
    } = value
    this.editor.api.filesToUpload[this.ownedFileIdentifier] = {
      file_id: fileId,
      file_token: fileToken
    }
  }

  setEnvMap() {
    this.editor.scene.environment = this.currentEnvMap.texture
  }
}
