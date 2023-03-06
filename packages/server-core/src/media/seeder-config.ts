import { ServicesSeedConfig } from '@etherealengine/common/src/interfaces/ServicesSeedConfig'

import { staticResourceTypeSeed } from './static-resource-type/static-resource-type.seed'

export const mediaSeeds: Array<ServicesSeedConfig> = [staticResourceTypeSeed]

export default mediaSeeds
