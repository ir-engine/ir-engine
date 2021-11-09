import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { store } from '../../store'
import { InventoryActionType } from './InventoryAction'
import { InventoryItem } from '@xrengine/common/src/interfaces/InventoryItem'
import { UserInventoryItem } from '@xrengine/common/src/interfaces/UserInventoryItem'
import { InventoryItemType } from '@xrengine/common/src/interfaces/InventoryItemType'
const state = createState({
  userInventoryItems: [] as Array<UserInventoryItem>,
  updateNeeded: true,
  total: 0,
  limit: 10,
  skip: 0,
  inventoryItemTypes: [] as Array<InventoryItemType>,
  inventory: {
    items: [] as Array<InventoryItem>,
    total: 0,
    limit: 10,
    skip: 0
  }
})

store.receptors.push((action: InventoryActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'LOADED_USER_INVENTORY':
        const userInventoryResult = action.userInventoryResult
        return s.merge({
          userInventoryItems: userInventoryResult.data,
          total: userInventoryResult.total,
          limit: userInventoryResult.limit,
          skip: userInventoryResult.skip
        })
      case 'LOADED_INVENTORY_TYPE':
        return s.inventoryItemTypes.set(action.inventoryItemTypeResult.data)
    }
  }, action.type)
})

export const accessInventoryState = () => state
export const useInventoryState = () => useState(state) as any as typeof state as unknown as typeof state
