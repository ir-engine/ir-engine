import { PerspectiveCamera, CameraHelper, Matrix4 } from 'three'
import { ComponentData } from '../../common/classes/ComponentData'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent, getCountOfComponentType } from '../../ecs/functions/ComponentFunctions'

export class ScenePreviewCameraData implements ComponentData {
  static legacyComponentName = ComponentNames.SCENE_PREVIEW_CAMERA

  constructor(obj3d: PerspectiveCamera, activeCamera: PerspectiveCamera) {
    this.activeCamera = activeCamera

    this.obj3d = obj3d
    this.obj3d.name = 'Scene Preview Camera'
    this.obj3d.fov = activeCamera.fov
    this.obj3d.aspect = activeCamera.aspect
    this.obj3d.near = activeCamera.near
    this.obj3d.far = activeCamera.far

    this.helper = new CameraHelper(this.obj3d)
  }

  activeCamera: PerspectiveCamera
  obj3d: PerspectiveCamera
  helper: CameraHelper

  setFromViewport() {
    if (!this.obj3d) return
    this.activeCamera.matrix.decompose(this.obj3d.position, this.obj3d.quaternion, this.obj3d.scale)
  }

  serialize(): object {
    return {}
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }

  canBeAdded(): boolean {
    return getCountOfComponentType(ScenePreviewCameraTagComponent) === 0
  }
}

export const ScenePreviewCameraTagComponent = createMappedComponent<ScenePreviewCameraData>(ComponentNames.SCENE_PREVIEW_CAMERA)
