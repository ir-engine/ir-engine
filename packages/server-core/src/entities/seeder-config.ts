import { ServicesSeedConfig } from '@xrengine/common/src/interfaces/ServicesSeedConfig'
import { collectionTypeSeed } from './collection-type/collection-type.seed'
import { collectionSeed } from './collection/collection.seed'
import { componentTypeSeed } from './component-type/component-type.seed'
import { componentSeed } from './component/component.seed'
import { entitySeed } from './entity/entity.seed'
import { inventoryItemTypeSeed } from './inventory-item-type/inventory-item-type.seed'
import { inventoryItemSeed } from './inventory-item/inventory-item.seed'

export const entitySeeds: Array<ServicesSeedConfig> = [collectionTypeSeed, collectionSeed, inventoryItemTypeSeed, inventoryItemSeed, entitySeed]

export const componentSeeds: Array<ServicesSeedConfig> = [componentTypeSeed, componentSeed]
