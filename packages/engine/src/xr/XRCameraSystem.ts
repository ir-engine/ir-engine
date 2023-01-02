import { getState } from '@xrengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import { XRState } from './XRState'

export default async function XRCameraSystem(world: World) {
  const execute = () => {
    const xrState = getState(XRState)
    const xrFrame = Engine.instance.xrFrame

    /** get viewer pose relative to the local floor */
    const referenceSpace = xrState.localFloorReferenceSpace.value
    const viewerTransform = referenceSpace && xrFrame?.getViewerPose(referenceSpace)?.transform
    xrState.viewerPoseMetrics.value.update(viewerTransform?.position, viewerTransform?.orientation)

    if (!xrFrame) return
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
