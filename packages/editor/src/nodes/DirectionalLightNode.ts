import EditorNodeMixin from './EditorNodeMixin'
import PhysicalDirectionalLight from '@xrengine/engine/src/scene/classes/PhysicalDirectionalLight'
import EditorDirectionalLightHelper from '../classes/EditorDirectionalLightHelper'
import { CameraHelper } from 'three'
export default class DirectionalLightNode extends EditorNodeMixin(PhysicalDirectionalLight) {
  static legacyComponentName = 'directional-light'
  static nodeName = 'Directional Light'
  static async deserialize(json) {
    const node = await super.deserialize(json)
    const { color, intensity, castShadow, shadowMapResolution, shadowBias, shadowRadius, cameraFar, showCameraHelper } =
      json.components.find((c) => c.name === 'directional-light').props
    node.color.set(color)
    node.intensity = intensity
    node.cameraFar = cameraFar ?? 100
    node.castShadow = castShadow
    node.shadowBias = shadowBias ?? 0.5
    node.shadowRadius = shadowRadius === undefined ? 1 : shadowRadius
    node.showCameraHelper = !!showCameraHelper
    if (shadowMapResolution) {
      node.shadowMapResolution.fromArray(shadowMapResolution)
    }
    return node
  }
  constructor() {
    super()
    this.helper = new EditorDirectionalLightHelper(this)
    this.helper.visible = false
    this.add(this.helper)

    this.cameraHelper = new CameraHelper(this.shadow.camera)
    this.cameraHelper.visible = false
    this.add(this.cameraHelper)

    this.cameraFar = 100
  }
  onAdd() {
    this.helper.update()
  }
  onChange() {
    this.helper.update()
    this.cameraHelper.visible = this.showCameraHelper

    this.shadow.bias = this.shadowBias
    this.shadow.radius = this.shadowRadius

    this.shadow.camera.far = this.cameraFar
    this.shadow.camera.updateProjectionMatrix()

    this.shadow.needsUpdate = true

    this.cameraHelper.update()
  }
  onSelect() {
    this.helper.visible = true
    this.cameraHelper.visible = this.showCameraHelper
  }
  onDeselect() {
    this.helper.visible = false
    this.cameraHelper.visible = false
  }
  copy(source, recursive = true) {
    super.copy(source, false)
    if (recursive) {
      this.remove(this.helper)
      this.remove(this.target)
      for (let i = 0; i < source.children.length; i++) {
        const child = source.children[i]
        if (child.type === 'CameraHelper') continue
        if (child === source.helper) {
          this.helper = new EditorDirectionalLightHelper(this)
          this.add(this.helper)
        } else if (child === source.target) {
          this.target = child.clone()
          this.add(this.target)
        } else if (child === source.cameraHelper) {
          this.cameraHelper = new CameraHelper(this.shadow.camera)
          this.cameraHelper.visible = false
          this.add(this.cameraHelper)
        } else {
          this.add(child.clone())
        }
      }
    }
    return this
  }
  async serialize(projectID) {
    return await super.serialize(projectID, {
      'directional-light': {
        color: this.color,
        intensity: this.intensity,
        castShadow: this.castShadow,
        shadowMapResolution: this.shadowMapResolution.toArray(),
        shadowBias: this.shadowBias,
        shadowRadius: this.shadowRadius,
        cameraFar: this.cameraFar,
        showCameraHelper: this.showCameraHelper
      }
    })
  }
  prepareForExport() {
    super.prepareForExport()
    this.remove(this.helper)
    this.addGLTFComponent('directional-light', {
      color: this.color,
      intensity: this.intensity,
      castShadow: this.castShadow,
      shadowMapResolution: this.shadowMapResolution.toArray(),
      shadowBias: this.shadowBias,
      shadowRadius: this.shadowRadius,
      cameraFar: this.cameraFar,
      showCameraHelper: this.showCameraHelper
    })
    this.replaceObject()
  }
}
