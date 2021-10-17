import { Quaternion, Vector3, Euler, Mesh } from 'three'
import { ComponentData } from '../../common/classes/ComponentData'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type PortalDataProps = {
  location: string
  linkedPortalId: string
  displayText: string
  isPlayerInPortal: boolean
  previewMesh: Mesh
  remoteSpawnPosition: Vector3
  remoteSpawnRotation: Quaternion
  remoteSpawnEuler: Euler
}

export class PortalData implements ComponentData {
  static legacyComponentName = ComponentNames.PORTAL

  constructor(obj3d: Mesh, props?: PortalDataProps) {
    this.obj3d = obj3d

    if (props) {
      
    }
  }

  obj3d: Mesh
  location: string
  linkedPortalId: string
  displayText: string
  isPlayerInPortal: boolean
  remoteSpawnPosition: Vector3
  remoteSpawnRotation: Quaternion
  remoteSpawnEuler: Euler

  serialize(): object {
    throw new Error('Method not implemented.')
  }
  serializeToJSON(): string {
    throw new Error('Method not implemented.')
  }
}

export const PortalComponent = createMappedComponent<PortalData>('PortalComponent')
