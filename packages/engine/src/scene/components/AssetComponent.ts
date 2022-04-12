import { AssetType } from '../../assets/enum/AssetType'
import { Entity } from '../../ecs/classes/Entity'
import { EntityTreeNode } from '../../ecs/classes/EntityTree'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type AssetId = string

export type AssetLoadedComponentType = {
  root: EntityTreeNode
}

export type AssetComponentType = {
  path: AssetId
  metadata?: {
    author?: string
    license?: string
  }
  loaded: boolean
}

export const AssetComponent = createMappedComponent<AssetComponentType>('AssetComponent')

export const AssetLoadedComponent = createMappedComponent<AssetLoadedComponentType>('AssetLoadedComponent')
