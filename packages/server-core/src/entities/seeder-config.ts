import { ServicesSeedConfig } from '@xrengine/common/src/interfaces/ServicesSeedConfig'
import { collectionTypeSeed } from './collection-type/collection-type.seed'
import { collectionSeed } from './collection/collection.seed'
import { componentTypeSeed } from './component-type/component-type.seed'
import { componentSeed } from './component/component.seed'
import { entitySeed } from './entity/entity.seed'

export const entitySeeds: Array<ServicesSeedConfig> = [collectionTypeSeed, collectionSeed, entitySeed]

export const componentSeeds: Array<ServicesSeedConfig> = [componentTypeSeed, componentSeed]
