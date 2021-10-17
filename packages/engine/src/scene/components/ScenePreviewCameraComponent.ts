import { PerspectiveCamera, CameraHelper, Matrix4 } from 'three'
import { ComponentData } from '../../common/classes/ComponentData'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent, getCountOfComponentType } from '../../ecs/functions/ComponentFunctions'

export class ScenePreviewCameraData implements ComponentData {
  static legacyComponentName = ComponentNames.SCENE_PREVIEW_CAMERA

  constructor(obj3d: PerspectiveCamera, activeCamera: PerspectiveCamera) {
    this.activeCamera = activeCamera

    this.obj3d = obj3d
    this.obj3d.fov = 80
    this.obj3d.aspect = 16/9
    this.obj3d.near = 0.2
    this.obj3d.far = 8000

    this.helper = new CameraHelper(this.obj3d)
    this.helper.layers.set(1)
  }

  activeCamera: PerspectiveCamera
  obj3d: PerspectiveCamera
  helper: CameraHelper

  setFromViewport() {
    if (!this.obj3d || !this.obj3d.parent) return

    const matrix = new Matrix4()
      .copy(this.obj3d.parent.matrixWorld)
      .invert()
      .multiply(this.activeCamera.matrixWorld)
    matrix.decompose(this.obj3d.position, this.obj3d.quaternion, this.obj3d.scale)
    // CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, [this])
    // CommandManager.instance.emitEvent(EditorEvents.SELECTION_CHANGED)
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

export const ScenePreviewCameraTagComponent = createMappedComponent<ScenePreviewCameraData>('ScenePreviewCameraTagComponent')
