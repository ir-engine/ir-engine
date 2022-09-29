import { Engine } from '../../ecs/classes/Engine'
import { XR8 } from './XR8'

export const XREPipeline = () => {
  return {
    name: 'XREPipeline',
    onAppResourcesLoaded: () => {},
    onAttach: () => {},
    onBeforeRun: () => {},
    onCameraStatusChange: () => {},
    onCanvasSizeChange: () => {},
    onDetach: () => {},
    onDeviceOrientationChange: () => {},
    onException: () => {},
    onPaused: () => {},
    onProcessCpu: () => {},
    onProcessGpu: () => {},
    onRemove: () => {},
    onRender: () => {},
    onResume: () => {},
    onStart: () => {
      XR8.XrController.updateCameraProjectionMatrix({
        origin: Engine.instance.currentWorld.camera.position,
        facing: Engine.instance.currentWorld.camera.quaternion
      })
    },
    onUpdate: () => {
      // XR8.XrController.updateCameraProjectionMatrix({
      //   origin: Engine.instance.currentWorld.camera.position,
      //   facing: Engine.instance.currentWorld.camera.quaternion,
      // })
    },
    onVideoSizeChange: () => {},
    requiredPermission: () => {}
  }
}
