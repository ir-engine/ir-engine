import { AvatarProps } from './WorldState'

export const NetworkWorldAction = {
  createClient(userId: string, avatarDetail?: AvatarProps) {
    return {
      type: 'network.CREATE_CLIENT' as const,
      userId,
      avatarDetail
    }
  },
  destroyClient(userId: string) {
    return {
      type: 'network.DESTROY_CLIENT' as const,
      userId
    }
  },
  createObject(networkId: number, uniqueId: string, prefabType: string, parameters: any) {
    return {
      type: 'network.CREATE_OBJECT' as const,
      networkId,
      uniqueId,
      prefabType,
      parameters
    }
  },
  editObject(networkId: number, updateType: number, values: number[], data: string[]) {
    return {
      type: 'network.EDIT_OBJECT' as const,
      networkId,
      updateType,
      values,
      data
    }
  },
  destroyObject(networkId: number) {
    return {
      type: 'network.DESTROY_OBJECT' as const,
      networkId
    }
  }
}

export type NetworkWorldActionType = ReturnType<typeof NetworkWorldAction[keyof typeof NetworkWorldAction]>
