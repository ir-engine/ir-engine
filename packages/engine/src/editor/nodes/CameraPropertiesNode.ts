import { Object3D } from 'three'
import EditorNodeMixin from './EditorNodeMixin'
export default class CameraPropertiesNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = 'cameraproperties'
  static nodeName = 'Camera Properties'

  static async deserialize(editor, json) {
    const node = await super.deserialize(editor, json)
    const {
      name,
      fov,
      cameraNearClip,
      cameraFarClip,
      projectionType,
      maxCameraDistance,
      startCameraDistance,
      minCameraDistance,
      cameraMode,
      cameraModeDefault,
      startInFreeLook,
      minPhi,
      maxPhi,
      startPhi
    } = json.components.find((c) => c.name === CameraPropertiesNode.legacyComponentName).props
    node.name = name
    node.fov = fov
    node.cameraNearClip = cameraNearClip
    node.cameraFarClip = cameraFarClip
    node.projectionType = projectionType
    node.minCameraDistance = minCameraDistance
    node.maxCameraDistance = maxCameraDistance
    node.cameraMode = cameraMode
    node.cameraModeDefault = cameraModeDefault,
    node.startCameraDistance = startCameraDistance
    node.startInFreeLook = startInFreeLook
    node.minPhi = minPhi,
    node.maxPhi = maxPhi,
    node.startPhi = startPhi
    return node
  }
  constructor(editor) {
    super(editor)
  }
  copy(source) {
    super.copy(source)
    return this
  }
  async serialize(projectID) {
    const components = {
      cameraproperties: {
        name: this.name,
        fov: this.fov,
        cameraNearClip: this.cameraNearClip,
        cameraFarClip: this.cameraFarClip,
        projectionType: this.projectionType,
        minCameraDistance: this.minCameraDistance,
        maxCameraDistance: this.maxCameraDistance,
        startCameraDistance: this.startCameraDistance,
        cameraMode: this.cameraMode,
        cameraModeDefault: this.cameraModeDefault,
        startInFreeLook: this.startInFreeLook,
        minPhi: this.minPhi,
        maxPhi: this.maxPhi,
        startPhi: this.startPhi
      }
    } as any
    return await super.serialize(projectID, components)
  }
  prepareForExport() {
    super.prepareForExport()
    this.remove(this.helper)
  }
}
