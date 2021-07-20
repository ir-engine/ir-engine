import EditorNodeMixin from './EditorNodeMixin'
import PhysicalDirectionalLight from '../../scene/classes/PhysicalDirectionalLight'
import EditorDirectionalLightHelper from '../classes/EditorDirectionalLightHelper'
import { CameraHelper } from 'three'
export default class DirectionalLightNode extends EditorNodeMixin(PhysicalDirectionalLight) {
  static legacyComponentName = 'directional-light'
  static nodeName = 'Directional Light'
  static async deserialize(editor, json) {
    const node = await super.deserialize(editor, json)
    const {
      color,
      intensity,
      castShadow,
      shadowMapResolution,
      shadowBias,
      shadowRadius,
      cameraFar,
      cameraNear,
      cameraBottom,
      cameraTop,
      cameraLeft,
      cameraRight,
      showCameraHelper
    } = json.components.find((c) => c.name === 'directional-light').props
    node.color.set(color)
    node.intensity = intensity
    node.cameraFar = cameraFar || 2000
    node.cameraNear = cameraNear || 0.1
    node.cameraTop = cameraTop || 5
    node.cameraBottom = cameraBottom || -5
    node.cameraLeft = cameraLeft || -5
    node.cameraRight = cameraRight || 5
    node.castShadow = castShadow
    node.shadowBias = shadowBias || 0
    node.shadowRadius = shadowRadius === undefined ? 1 : shadowRadius
    node.showCameraHelper = !!showCameraHelper
    if (shadowMapResolution) {
      node.shadowMapResolution.fromArray(shadowMapResolution)
    }
    return node
  }
  constructor(editor) {
    super(editor)
    this.helper = new EditorDirectionalLightHelper(this)
    this.helper.visible = false
    this.add(this.helper)

    this.cameraHelper = new CameraHelper(this.shadow.camera)
    this.cameraHelper.visible = false
    this.add(this.cameraHelper)
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
    this.shadow.camera.near = this.cameraNear
    this.shadow.camera.top = this.cameraTop
    this.shadow.camera.bottom = this.cameraBottom
    this.shadow.camera.left = this.cameraLeft
    this.shadow.camera.right = this.cameraRight

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
        if (child === source.helper) {
          this.helper = new EditorDirectionalLightHelper(this)
          this.add(this.helper)
        } else if (child === source.target) {
          this.target = child.clone()
          this.add(this.target)
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
        cameraNear: this.cameraNear,
        cameraTop: this.cameraTop,
        cameraBottom: this.cameraBottom,
        cameraLeft: this.cameraLeft,
        cameraRight: this.cameraRight,
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
      cameraNear: this.cameraNear,
      cameraTop: this.cameraTop,
      cameraBottom: this.cameraBottom,
      cameraLeft: this.cameraLeft,
      cameraRight: this.cameraRight,
      showCameraHelper: this.showCameraHelper
    })
    this.replaceObject()
  }
}
