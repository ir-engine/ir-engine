import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export const MountPoint = {
  seat: 'seat' as const
}

export type MountPointTypes = typeof MountPoint[keyof typeof MountPoint]

export type MountPointComponentType = {
  type: MountPointTypes
  animation: {
    enter?: {
      file: string
      animation: string
      animations: string[]
    }
    leave?: {
      file: string
      animation: string
      animations: string[]
    }
    active?: {
      file: string
      animation: string
      animations: string[]
    }
  }
}

export const MountPointComponent = createMappedComponent<MountPointComponentType>('MountPointComponent')
