import matches, { Validator } from 'ts-matches'

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
      loaded: LoadState.UNLOADED,
      roots: [],
      dirty: false
    } as AssemblyComponentType),

  onSet: (entity, component, json) => {
    if (!json) return
    matches.boolean.test(json.dirty) && component.dirty.set(json.dirty)
    ;(matches.string as Validator<unknown, LoadState>).test(json.loaded) && component.loaded.set(json.loaded)
    matches.arrayOf(matches.object as Validator<unknown, EntityTreeNode>).test(json.roots) &&
      component.roots.set(json.roots)
    matches.string.test(json.src) && component.src.set(json.src)
  },

  toJSON: (entity, component) => {
    return {
      src: component.src.value,
      loaded: component.loaded.value
    }
  },

  onRemove: unloadAsset
})
