import { createMappedComponent, defineComponent } from '../../ecs/functions/ComponentFunctions'
import { EntityTreeNode } from '../../ecs/functions/EntityTree'
import { unloadAsset } from '../functions/loaders/AssemblyComponentFunctions'

export enum LoadState {
  UNLOADED = 'unloaded',
  LOADING = 'loading',
  LOADED = 'loaded'
}

export type AssemblyComponentType = {
  src: string
  metadata?: {
    author?: string
    license?: string
  }
  loaded: LoadState
  roots: EntityTreeNode[]
  dirty: boolean
}

export const SCENE_COMPONENT_ASSEMBLY = 'assembly'

export const AssemblyComponent = defineComponent({
  name: 'AssemblyComponent',

  onInit: (entity) =>
    ({
      src: '',
      metadata: {},
      loaded: LoadState.UNLOADED,
      roots: [],
      dirty: false
    } as AssemblyComponentType),

  onRemove: unloadAsset
})
