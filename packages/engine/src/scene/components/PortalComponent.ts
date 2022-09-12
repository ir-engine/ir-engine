import { RigidBodyType, ShapeType } from '@dimforge/rapier3d-compat'
import { Mesh, MeshBasicMaterial, Quaternion, SphereGeometry, Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { ColliderComponentType } from './ColliderComponent'

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
  mesh?: Mesh<SphereGeometry, MeshBasicMaterial>
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

export const SCENE_COMPONENT_PORTAL_COLLIDER_VALUES = {
  bodyType: RigidBodyType.Fixed,
  shapeType: ShapeType.Cuboid,
  isTrigger: true,
  removeMesh: true,
  collisionLayer: CollisionGroups.Trigger,
  collisionMask: CollisionGroups.Avatars,
  target: '',
  onEnter: 'teleport'
} as ColliderComponentType
