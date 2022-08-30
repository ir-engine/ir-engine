import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export const MountPoint = {
  seat: 'seat' as const
}

export type MountPointTypes = typeof MountPoint[keyof typeof MountPoint]

export type MountPointComponentType = {
  type: MountPointTypes
}

export const MountPointComponent = createMappedComponent<MountPointComponentType>('MountPointComponent')

export const SCENE_COMPONENT_MOUNT_POINT = 'mount-point'
export const SCENE_COMPONENT_MOUNT_POINT_DEFAULT_VALUES = {
  type: MountPoint.seat
} as MountPointComponentType
