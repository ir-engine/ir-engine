import { dispatchAction } from '@xrengine/hyperflux'

import { patchNavigator } from '../webxr-emulator/patchNavigator'
import { XRAction } from '../XRAction'
import { XR8 } from './XR8'

const startPolyfill = () => {
  try {
    patchNavigator()
  } catch (e) {
    console.error(e)
  }

  // override session supported request, it hangs indefinitely for some reason
  ;(navigator as any).xr.isSessionSupported = () => {
    return true
  }

  console.log('request session')

  dispatchAction(XRAction.requestSession({ mode: 'immersive-ar' }))
}

export const XREPipeline = () => {
  setTimeout(() => {
    startPolyfill()
  }, 5000)
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
      const { scene, camera } = XR8.Threejs.xrScene()
      XR8.XrController.updateCameraProjectionMatrix({
        origin: camera.position,
        facing: camera.quaternion
      })
    },
    onUpdate: () => {
      // console.log('onupdate')
      // XR8.XrController.updateCameraProjectionMatrix({
      //   origin: globalThis.position,
      //   facing: globalThis.quaternion
      // })
      // XR8.XrController.updateCameraProjectionMatrix({
      //   origin: Engine.instance.currentWorld.camera.position,
      //   facing: Engine.instance.currentWorld.camera.quaternion,
      // })
    },
    onVideoSizeChange: () => {},
    requiredPermission: () => {}
  }
}
