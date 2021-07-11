import { ServicesSeedConfig } from '@xrengine/common/src/interfaces/ServicesSeedConfig'
import { staticResourceTypeSeed } from './static-resource-type/static-resource-type.seed'
import { staticResourceSeed } from './static-resource/static-resource.seed'

export const mediaSeeds: Array<ServicesSeedConfig> = [staticResourceTypeSeed, staticResourceSeed]

export default mediaSeeds
