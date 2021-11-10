import { inventoryItemTypeSeed } from './inventory-item-type/inventory-item-type.seed'
import { ServicesSeedConfig } from '@xrengine/common/src/interfaces/ServicesSeedConfig'
import { userRoleSeed } from './user-role/user-role.seed'
import { userSeed } from './user/user.seed'
import { userRelationshipTypeSeed } from './user-relationship-type/user-relationship-type.seed'

export const userSeeds: Array<ServicesSeedConfig> = [
  inventoryItemTypeSeed,
  userRoleSeed,
  userRelationshipTypeSeed,
  userSeed
]

export default userSeeds
