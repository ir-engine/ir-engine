import { inventoryItemTypeSeed } from './inventory-item-type/inventory-item-type.seed'
import { ServicesSeedConfig } from '@xrengine/common/src/interfaces/ServicesSeedConfig'
import { userRoleSeed } from './user-role/user-role.seed'
import { inventoryItemSeed } from './inventory-item/inventory-item.seed'
import { userRelationshipTypeSeed } from './user-relationship-type/user-relationship-type.seed'

export const userSeeds: Array<ServicesSeedConfig> = [
  inventoryItemTypeSeed,
  inventoryItemSeed,
  userRoleSeed,
  userRelationshipTypeSeed
]

export default userSeeds
