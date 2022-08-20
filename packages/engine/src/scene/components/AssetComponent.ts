import { EntityTreeNode } from '../../ecs/classes/EntityTree'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type AssetLoadedComponentType = {
  roots: EntityTreeNode[]
}

export enum LoadState {
  UNLOADED,
  LOADING,
  LOADED
}

export type AssetComponentType = {
  path: string
  name: string
  metadata?: {
    author?: string
    license?: string
  }
  loaded: LoadState
}

export const AssetComponent = createMappedComponent<AssetComponentType>('AssetComponent')

export const AssetLoadedComponent = createMappedComponent<AssetLoadedComponentType>('AssetLoadedComponent')

export const SCENE_COMPONENT_ASSET = 'asset'
export const SCENE_COMPONENT_ASSET_DEFAULT_VALUES = {
  name: '',
  path: '',
  loaded: LoadState.UNLOADED
}
