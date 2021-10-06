import { PerspectiveCamera, CameraHelper, Matrix4 } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'


// TODO: work in progress
export type ScenePreviewCameraTagComponentProps = {
  obj3d: PerspectiveCamera
}

export class ScenePreviewCameraTagComponentClass {
  static legacyComponentName = 'scene-preview-camera'
  static nodeName = 'Scene Preview Camera'

  constructor(props: ScenePreviewCameraTagComponentProps) {
    this.obj3d = props.obj3d ?? new PerspectiveCamera(80, 16 / 9, 0.2, 8000)
    const cameraHelper = new CameraHelper(this.obj3d)
    cameraHelper.layers.set(1)
    this.helper = cameraHelper
  }

  obj3d: PerspectiveCamera
  helper: CameraHelper

  setFromViewport() {
    if (!this.obj3d || !this.obj3d.parent) return

    // const matrix = new Matrix4()
    //   .copy(this.obj3d.parent.matrixWorld)
    //   .invert()
    //   .multiply(SceneManager.instance.camera.matrixWorld)
    // matrix.decompose(this.obj3d.position, this.obj3d.quaternion, this.obj3d.scale)
    // CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, [this])
    // CommandManager.instance.emitEvent(EditorEvents.SELECTION_CHANGED)
  }
}

export const ScenePreviewCameraTagComponent = createMappedComponent('ScenePreviewCameraTagComponent')
