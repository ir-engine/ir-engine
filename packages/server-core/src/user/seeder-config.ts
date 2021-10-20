import { userRoleSeed } from './user-role/user-role.seed'
import { userSeed } from './user/user.seed'
import { userRelationshipTypeSeed } from './user-relationship-type/user-relationship-type.seed'
import { ServicesSeedConfig } from '@xrengine/common/src/interfaces/ServicesSeedConfig'

export const userSeeds: Array<ServicesSeedConfig> = [userRoleSeed, userRelationshipTypeSeed, userSeed]

export default userSeeds
