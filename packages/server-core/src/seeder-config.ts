import { ServicesSeedConfig } from '@xrengine/common/src/interfaces/ServicesSeedConfig'
import { entitySeeds, componentSeeds } from './entities/seeder-config'
import { mediaSeeds } from './media/seeder-config'
import { networkingSeeds } from './networking/seeder-config'
import { paymentSeeds } from './payments/seeder-config'
import { socialSeeds } from './social/seeder-config'
import { socialMediaSeeds } from './socialmedia/seeder-config'
import { userSeeds } from './user/seeder-config'
import { worldSeeds } from './world/seeder-config'
import { scopeSeeds } from './scope/seeder-config'

export const seeds: Array<ServicesSeedConfig> = [
  ...entitySeeds,
  ...mediaSeeds,
  ...networkingSeeds,
  ...paymentSeeds,
  ...socialSeeds,
  ...socialMediaSeeds,
  ...userSeeds,
  ...worldSeeds,
  ...componentSeeds,
  ...scopeSeeds
]

export default seeds
