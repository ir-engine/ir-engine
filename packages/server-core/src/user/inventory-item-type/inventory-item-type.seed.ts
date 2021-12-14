import { inventoryItemType } from './inventoryItemType'

export const inventoryItemTypeSeed = {
  path: 'inventory-item-type',
  templates: [
    { inventoryItemType: inventoryItemType.skill },
    { inventoryItemType: inventoryItemType.weapon },
    { inventoryItemType: inventoryItemType.ammo },
    { inventoryItemType: inventoryItemType.player },
    { inventoryItemType: inventoryItemType.coin }
  ]
}
