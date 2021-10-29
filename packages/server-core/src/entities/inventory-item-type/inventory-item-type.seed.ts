import { inventoryItemType } from './inventoryItemType'

export const inventoryItemTypeSeed = {
  path: 'inventory-item-type',
  randomize: false,
  templates: [
    { inventoryItemType: inventoryItemType.skill },
    { inventoryItemType: inventoryItemType.weapon },
    { inventoryItemType: inventoryItemType.ammo },
    { inventoryItemType: inventoryItemType.player }
  ]
}
