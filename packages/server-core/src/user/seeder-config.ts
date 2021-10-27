import { userRoleSeed } from './user-role/user-role.seed'
import { userSeed } from './user/user.seed'
import { userRelationshipTypeSeed } from './user-relationship-type/user-relationship-type.seed'
import { ServicesSeedConfig } from '@xrengine/common/src/interfaces/ServicesSeedConfig'
import { userInventorySeed } from './user-inventory/user-inventory.seed'

export const userSeeds: Array<ServicesSeedConfig> = [userRoleSeed, userRelationshipTypeSeed, userSeed, userInventorySeed]

export default userSeeds
