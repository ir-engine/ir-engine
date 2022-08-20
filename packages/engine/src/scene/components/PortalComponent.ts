import { Quaternion, Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type PortalComponentType = {
  location: string
  linkedPortalId: string
  redirect: boolean
  effectType: string
  previewType: string
  previewImageURL: string
  spawnPosition: Vector3
  spawnRotation: Quaternion
  remoteSpawnPosition: Vector3
  remoteSpawnRotation: Quaternion
}

export const PortalPreviewTypeSimple = 'Simple' as const
export const PortalPreviewTypeSpherical = 'Spherical' as const

export const PortalComponent = createMappedComponent<PortalComponentType>('PortalComponent')

export const SCENE_COMPONENT_PORTAL = 'portal'
export const SCENE_COMPONENT_PORTAL_DEFAULT_VALUES = {
  linkedPortalId: '',
  location: '',
  effectType: 'None',
  previewType: PortalPreviewTypeSimple,
  previewImageURL: '',
  redirect: false,
  spawnPosition: new Vector3(),
  spawnRotation: new Quaternion(),
  remoteSpawnPosition: new Vector3(),
  remoteSpawnRotation: new Quaternion()
} as PortalComponentType
