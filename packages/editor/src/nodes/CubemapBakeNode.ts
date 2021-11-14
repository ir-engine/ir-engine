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
  WebGLCubeRenderTarget
} from 'three'
import { CubemapBakeRefreshTypes } from '@xrengine/engine/src/scene/types/CubemapBakeRefreshTypes'
import { CubemapBakeSettings } from '@xrengine/engine/src/scene/types/CubemapBakeSettings'
import { CubemapBakeTypes } from '@xrengine/engine/src/scene/types/CubemapBakeTypes'
import EditorNodeMixin from './EditorNodeMixin'
import { envmapPhysicalParsReplace, worldposReplace } from '@xrengine/engine/src/scene/classes/BPCEMShader'
import CubemapCapturer from '@xrengine/engine/src/scene/classes/CubemapCapturer'
import { convertCubemapToEquiImageData } from '@xrengine/engine/src/scene/classes/ImageUtils'
import SkyboxNode from './SkyboxNode'
import { uploadProjectAsset } from '../functions/assetFunctions'
import { accessEditorState } from '../services/EditorServices'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import SceneNode from './SceneNode'

const assetIdentitifer = 'cubemapbake'

export default class CubemapBakeNode extends EditorNodeMixin(Object3D) {
  static nodeName = 'Cubemap Bake'
  static legacyComponentName = 'cubemapbake'
  static haveStaticTags = false
  gizmo: BoxHelper
  cubemapBakeSettings: CubemapBakeSettings
  centerBall: Mesh
  currentEnvMap: WebGLCubeRenderTarget

  constructor() {
    super()
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
    this.add(this.gizmo)(Engine.scene as any as SceneNode).registerEnvironmentMapNode(this)
  }

  static canAddNode() {
    return (Engine.scene as any as SceneNode).findNodeByType(CubemapBakeNode) === null
  }

  async captureCubeMap(): Promise<WebGLCubeRenderTarget> {
    const sceneToBake = this.getSceneForBaking(Engine.scene as any as SceneNode as any)
    const cubemapCapturer = new CubemapCapturer(Engine.renderer, sceneToBake, this.cubemapBakeSettings.resolution)
    const result = cubemapCapturer.update(this.position)
    const imageData = (await convertCubemapToEquiImageData(Engine.renderer, result, 512, 512, false)).imageData
    // downloadImage(imageData, 'Hello', 512, 512)
    this.currentEnvMap = result
    this.injectShader()
    ;(Engine.scene as any as SceneNode).setUpEnvironmentMap()
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
    //(Engine.scene as any as SceneNode).environment=this.visible?this.currentEnvMap?.texture:null;
  }

  injectShader() {
    ;(Engine.scene as any as SceneNode).traverse((child) => {
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

  static async deserialize(json) {
    const node = await super.deserialize(json)
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
            if (child.constructor === SkyboxNode) sceneToBake.background = (Engine.scene as any as SceneNode).background
          }
        })
        sceneToBake.add(o)
      }
    })
    return sceneToBake
  }

  onRemove() {
    this.currentEnvMap?.dispose()
    ;(Engine.scene as any as SceneNode).unregisterEnvironmentMapNode(this)
    // todo - remove generated asset
  }

  async uploadBakeToServer(projectID: any, renderTarget: WebGLCubeRenderTarget) {
    const { blob } = await convertCubemapToEquiImageData(
      Engine.renderer,
      renderTarget,
      this.cubemapBakeSettings.resolution,
      this.cubemapBakeSettings.resolution,
      true
    )
    const sceneName = accessEditorState().sceneName.value
    const value = await uploadProjectAsset(projectID, [
      new File([blob], `${sceneName}-${this.nodeName.replace(' ', '-')}.png`)
    ])

    console.log('uploadBakeToServer', value)
    this.cubemapBakeSettings.envMapOrigin = value[0].url
  }

  setEnvMap() {
    ;(Engine.scene as any as SceneNode).environment = this.currentEnvMap.texture
  }
}
