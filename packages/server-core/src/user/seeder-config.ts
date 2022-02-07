import { ServicesSeedConfig } from '@xrengine/common/src/interfaces/ServicesSeedConfig'
import { userRoleSeed } from './user-role/user-role.seed'
import { userRelationshipTypeSeed } from './user-relationship-type/user-relationship-type.seed'

export const userSeeds: Array<ServicesSeedConfig> = [userRoleSeed, userRelationshipTypeSeed]

export default userSeeds
