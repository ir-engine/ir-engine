import { UserInventoryResult } from '@xrengine/common/src/interfaces/UserInventoryResult'
import { InventoryItemTypeResult } from '@xrengine/common/src/interfaces/InventoryItemTypeResult'
export const InventoryAction = {
  loadedUserInventory: (userInventoryResult: UserInventoryResult) => {
    return {
      type: 'LOADED_USER_INVENTORY' as const,
      userInventoryResult
    }
  },
  inventoryType: (inventoryItemTypeResult: InventoryItemTypeResult) => {
    return {
      type: 'LOADED_INVENTORY_TYPE' as const,
      inventoryItemTypeResult
    }
  }
}

export type InventoryActionType = ReturnType<typeof InventoryAction[keyof typeof InventoryAction]>
