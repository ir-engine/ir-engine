import { Quaternion, Vector3, Euler, Mesh } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type PortalComponentType = {
  location: string
  linkedPortalId: string
  isPlayerInPortal: boolean
  displayText: string
  previewMesh: Mesh
  remoteSpawnPosition: Vector3
  remoteSpawnRotation: Quaternion
  remoteSpawnEuler: Euler
}

export const PortalComponent = createMappedComponent<PortalComponentType>('PortalComponent')
