import { World } from '../../ecs/classes/World'
import { XR8 } from './XR8'
import { onUpdate } from './XR8Types'

export const XREPipeline = (world: World) => {
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
      const { camera } = XR8.Threejs.xrScene()
      /** sync camera */
      XR8.XrController.updateCameraProjectionMatrix({
        origin: camera.position,
        facing: camera.quaternion
      })
    },
    onUpdate: (props: onUpdate) => {
      const { processCpuResult } = props
      if (processCpuResult.reality) {
      }
    },
    onVideoSizeChange: () => {},
    requiredPermission: () => {}
  }
}
