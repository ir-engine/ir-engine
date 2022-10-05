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
      const { camera, renderer } = XR8.Threejs.xrScene()
      renderer.render = (scene, camera) => {
        /** disable the 8thwall threejs renderer */
      }
      /** sync camera */
      XR8.XrController.updateCameraProjectionMatrix({
        origin: camera.position,
        facing: camera.quaternion
      })
    },
    onUpdate: (props: onUpdate) => {
      const { processCpuResult } = props
      // console.log(processCpuResult)
      if (processCpuResult.reality) {
        /** @todo support lighting */
      }
    },
    onVideoSizeChange: () => {},
    requiredPermission: () => {}
  }
}
