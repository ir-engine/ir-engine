import { Quaternion, Vector3, Euler } from 'three'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type PortalComponentType = {
  location: string
  linkedPortalId: string
  displayText: string
  spawnEuler: Euler
  isPlayerInPortal: boolean
  remoteSpawnPosition: Vector3
  remoteSpawnRotation: Quaternion
  remoteSpawnEuler: Euler
}

export const PortalComponent = createMappedComponent<PortalComponentType>()
