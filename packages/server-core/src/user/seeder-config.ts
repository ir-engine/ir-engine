import { ServicesSeedConfig } from '@etherealengine/common/src/interfaces/ServicesSeedConfig'

import { userRelationshipTypeSeed } from './user-relationship-type/user-relationship-type.seed'

export const userSeeds: Array<ServicesSeedConfig> = [userRelationshipTypeSeed]

export default userSeeds
