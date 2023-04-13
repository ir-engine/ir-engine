import { InputSystemGroup, insertSystems } from '../ecs/functions/SystemFunctions'
import XR8 from './8thwall/XR8'
import { VPSSystem } from './VPSSystem'
import { XRCameraSystem } from './XRCameraSystem'
import { XRCameraViewSystem } from './XRCameraViewSystem'
import { XRDetectedPlanesSystem } from './XRDetectedPlanesSystem'
import { XRHapticsSystem } from './XRHapticsSystem'
import { XRInputSourceSystem } from './XRInputSourceSystem'
import { XRLightProbeSystem } from './XRLightProbeSystem'
import { XRPersistentAnchorSystem } from './XRPersistentAnchorSystem'
import { XRScenePlacementShaderSystem } from './XRScenePlacementShaderSystem'
import { XRSystem } from './XRSystem'

export const XRSystems = () => {
  insertSystems([XRSystem], 'before', InputSystemGroup)
  insertSystems(
    [
      VPSSystem,
      XRCameraSystem,
      XRCameraViewSystem,
      XRDetectedPlanesSystem,
      XRHapticsSystem,
      XRInputSourceSystem,
      XRLightProbeSystem,
      XRPersistentAnchorSystem,
      XRScenePlacementShaderSystem
    ],
    'with',
    XRSystem
  )
}
