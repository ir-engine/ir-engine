import { UserInventoryItem } from '@xrengine/common/src/interfaces/UserInventoryItem'

export interface InventoryItem {
  createdAt: string
  description?: string
  inventoryItemId: string
  inventoryItemTypeId?: string
  inventory_item_type?: any
  isPublic: boolean
  metadata: string
  name: string
  ownedFileIds?: any
  sid: string
  updatedAt: string
  url: string
  user_inventory: UserInventoryItem
  version: number
}
