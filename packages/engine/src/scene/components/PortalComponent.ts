import { Quaternion, Vector3, Euler, Mesh } from 'three'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type PortalComponentType = {
  location: string
  linkedPortalId: string
  displayText: string
  isPlayerInPortal: boolean
  previewMesh: Mesh
  remoteSpawnPosition: Vector3
  remoteSpawnRotation: Quaternion
  remoteSpawnEuler: Euler
}

export const PortalComponent = createMappedComponent<PortalComponentType>()
