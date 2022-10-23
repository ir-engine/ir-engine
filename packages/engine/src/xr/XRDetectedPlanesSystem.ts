import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'

type DetectedPlanesType = {
  detectedPlanes: XRPlaneSet
}

export default async function XRDetectedPlanesSystem(world: World) {
  const execute = () => {
    const frame = Engine.instance.xrFrame as XRFrame & DetectedPlanesType
    if (!frame) return
    /** oculus implements detectedPlanes on the XRFrame, but the current typescript implementation has it on worldInformation */
    const detectedPlanes = frame.worldInformation?.detectedPlanes ?? frame.detectedPlanes
    console.log(detectedPlanes)
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
