import { Euler, Mesh, Quaternion, Vector3 } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type PortalComponentType = {
  location: string
  linkedPortalId: string
  helper: Entity
  redirect: boolean
  effectType: string
  previewType: string
  previewImageURL: string
  // todo: refactor these
  spawnPosition: Vector3
  spawnRotation: Quaternion
  remoteSpawnPosition: Vector3
  remoteSpawnRotation: Quaternion
}

export const PortalPreviewTypeSimple = 'Simple' as const
export const PortalPreviewTypeSpherical = 'Spherical' as const

export const PortalComponent = createMappedComponent<PortalComponentType>('PortalComponent')
