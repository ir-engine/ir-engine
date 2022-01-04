import { Object3D } from 'three'
import { CameraMode } from '@xrengine/engine/src/camera/types/CameraMode'
import { ProjectionType } from '@xrengine/engine/src/camera/types/ProjectionType'
import EditorNodeMixin from './EditorNodeMixin'
export default class CameraPropertiesNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = 'cameraproperties'
  static nodeName = 'Camera Properties'

  static async deserialize(json) {
    const node = await super.deserialize(json)
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
    node.fov = fov ?? 50
    node.cameraNearClip = cameraNearClip ?? 0.01
    node.cameraFarClip = cameraFarClip ?? 100
    node.projectionType = projectionType ?? ProjectionType.Perspective
    node.minCameraDistance = minCameraDistance ?? 1
    node.maxCameraDistance = maxCameraDistance ?? 50
    node.cameraMode = cameraMode ?? CameraMode.Dynamic
    node.cameraModeDefault = cameraModeDefault ?? CameraMode.ThirdPerson
    node.startInFreeLook = startInFreeLook ?? false
    node.startCameraDistance = startCameraDistance ?? 5
    node.minPhi = minPhi ?? -70
    node.maxPhi = maxPhi ?? 85
    node.startPhi = startPhi ?? 10
    return node
  }
  constructor() {
    super()
  }
  copy(source) {
    super.copy(source)
    return this
  }
  async serialize(projectID) {
    const components = {
      cameraproperties: {
        name: this.name,
        fov: this.fov ?? 50,
        cameraNearClip: this.cameraNearClip ?? 0.01,
        cameraFarClip: this.cameraFarClip ?? 100,
        projectionType: this.projectionType ?? ProjectionType.Perspective,
        minCameraDistance: this.minCameraDistance ?? 1,
        maxCameraDistance: this.maxCameraDistance ?? 50,
        startCameraDistance: this.startCameraDistance ?? 5,
        cameraMode: this.cameraMode ?? CameraMode.Dynamic,
        cameraModeDefault: this.cameraModeDefault ?? CameraMode.ThirdPerson,
        startInFreeLook: this.startInFreeLook ?? false,
        minPhi: this.minPhi ?? -70,
        maxPhi: this.maxPhi ?? 85,
        startPhi: this.startPhi ?? 10
      }
    } as any
    return await super.serialize(projectID, components)
  }
  prepareForExport() {
    super.prepareForExport()
    this.remove(this.helper)
  }
}
