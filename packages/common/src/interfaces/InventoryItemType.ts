import { InventoryItem } from './InventoryItem'
export interface InventoryItemType {
  inventoryItemType: string
  inventoryItemTypeId: string
  inventory_items: InventoryItem[]
}
