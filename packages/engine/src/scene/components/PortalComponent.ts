import { Quaternion, Vector3, Euler, Mesh } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type PortalComponentType = {
  location: string
  linkedPortalId: string
  isPlayerInPortal: boolean
  displayText: string
  previewMesh: Mesh
  helper: Entity
  // todo: refactor these
  spawnPosition?: Vector3
  spawnRotation?: Quaternion
  remoteSpawnPosition: Vector3
  remoteSpawnRotation: Quaternion
  remoteSpawnEuler: Euler
}

export const PortalComponent = createMappedComponent<PortalComponentType>('PortalComponent')
