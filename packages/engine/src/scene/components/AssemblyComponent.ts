import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { EntityTreeNode } from '../../ecs/functions/EntityTree'

export type AssemblyLoadedComponentType = {
  roots: EntityTreeNode[]
}

export enum LoadState {
  UNLOADED,
  LOADING,
  LOADED
}

export type AssemblyComponentType = {
  src: string
  name: string
  metadata?: {
    author?: string
    license?: string
  }
  loaded: LoadState
}

export const AssemblyComponent = createMappedComponent<AssemblyComponentType>('AssemblyComponent')

export const AssemblyLoadedComponent = createMappedComponent<AssemblyLoadedComponentType>('AssemblyLoadedComponent')

export const SCENE_COMPONENT_ASSEMBLY = 'asset'
export const SCENE_COMPONENT_ASSEMBLY_DEFAULT_VALUES = {
  name: '',
  path: '',
  loaded: LoadState.UNLOADED
}
