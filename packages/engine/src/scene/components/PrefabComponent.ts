import { useEffect } from 'react'
import matches, { Validator } from 'ts-matches'

import {
  createMappedComponent,
  defineComponent,
  getComponent,
  hasComponent,
  useComponent
} from '../../ecs/functions/ComponentFunctions'
import { EntityReactorProps } from '../../ecs/functions/EntityFunctions'
import { EntityTreeNode } from '../../ecs/functions/EntityTree'
import { unloadPrefab } from '../functions/loaders/PrefabComponentFunctions'

export enum LoadState {
  UNLOADED = 'unloaded',
  LOADING = 'loading',
  LOADED = 'loaded'
}

export type PrefabComponentType = {
  src: string
  loaded: LoadState
  roots: EntityTreeNode[]
  dirty: boolean
}

export const SCENE_COMPONENT_PREFAB = 'prefab'

export const PrefabComponent = defineComponent({
  name: 'PrefabComponent',

  onInit: (entity) =>
    ({
      src: '',
      loaded: LoadState.UNLOADED,
      roots: [],
      dirty: false
    } as PrefabComponentType),

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

  onRemove: unloadPrefab,

  reactor: function ({ root }: EntityReactorProps) {
    const entity = root.entity
    if (!hasComponent(entity, PrefabComponent)) throw root.stop()
    const assembly = getComponent(entity, PrefabComponent)
    const assemblyState = useComponent(entity, PrefabComponent)

    useEffect(() => {
      switch (assembly.loaded) {
        case LoadState.LOADED:
        case LoadState.LOADING:
          assemblyState.dirty.set(true)
          break
      }
    }, [assemblyState.src])

    useEffect(() => {
      switch (assembly.loaded) {
        case LoadState.LOADED:
        case LoadState.UNLOADED:
          assemblyState.dirty.set(false)
      }
    }, [assemblyState.loaded])
    return null
  }
})
