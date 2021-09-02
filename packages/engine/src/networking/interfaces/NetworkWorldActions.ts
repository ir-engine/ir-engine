import { WeightsParameterType } from '../../avatar/animations/Util'
import { Pose } from '../../transform/TransformInterfaces'
import { AvatarProps } from './WorldState'

export const NetworkWorldActions = {
  ENTER_VR: 'network.ENTER_VR' as const,
  CREATE_CLIENT: 'network.CREATE_CLIENT' as const,
  DESTROY_CLIENT: 'network.DESTROY_CLIENT' as const,
  CREATE_OBJECT: 'network.CREATE_OBJECT' as const,
  EQUIP_OBJECT: 'network.EQUIP_OBJECT' as const,
  DESTROY_OBJECT: 'network.DESTROY_OBJECT' as const,
  ANIMATION_CHANGE: 'network.ANIMATION_CHANGE' as const,
  TELEPORT: 'network.TELEPORT' as const
}

export const NetworkWorldAction = {
  enterVR(networkId: number, enter: boolean) {
    return {
      type: NetworkWorldActions.ENTER_VR,
      networkId,
      enter
    }
  },
  createClient(userId: string, avatarDetail?: AvatarProps) {
    return {
      type: NetworkWorldActions.CREATE_CLIENT,
      userId,
      avatarDetail
    }
  },
  destroyClient(userId: string) {
    return {
      type: NetworkWorldActions.DESTROY_CLIENT,
      userId
    }
  },
  createObject(networkId: number, uniqueId: string, prefabType: string, parameters: any) {
    return {
      type: NetworkWorldActions.CREATE_OBJECT,
      networkId,
      uniqueId,
      prefabType,
      parameters
    }
  },
  equipObject(equipperNetworkId: number, equippedNetworkId: number, equip: boolean) {
    return {
      type: NetworkWorldActions.EQUIP_OBJECT,
      equipperNetworkId,
      equippedNetworkId,
      equip
    }
  },
  destroyObject(networkId: number) {
    return {
      type: NetworkWorldActions.DESTROY_OBJECT,
      networkId
    }
  },
  avatarAnimation(networkId: number, newStateName: string, params: WeightsParameterType) {
    return {
      type: NetworkWorldActions.ANIMATION_CHANGE,
      networkId,
      newStateName,
      params
    }
  },
  teleportObject(networkId: number, pose: Pose) {
    return {
      type: NetworkWorldActions.TELEPORT,
      networkId,
      pose
    }
  }
}

export type NetworkWorldActionType = ReturnType<typeof NetworkWorldAction[keyof typeof NetworkWorldAction]>
