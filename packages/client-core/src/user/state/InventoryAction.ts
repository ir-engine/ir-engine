export const InventoryAction = {
  loadedUserInventory: (userInventory: any) => {
    return {
      type: 'LOADED_USER_INVENTORY' as const,
      userInventory
    }
  }
}

export type InventoryActionType = ReturnType<typeof InventoryAction[keyof typeof InventoryAction]>
