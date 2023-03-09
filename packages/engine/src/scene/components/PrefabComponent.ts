import { useEffect } from 'react'
import matches, { Validator } from 'ts-matches'

import { matchesEntity } from '../../common/functions/MatchesUtils'
import { Entity } from '../../ecs/classes/Entity'
import { defineComponent, getComponent, hasComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { EntityReactorProps } from '../../ecs/functions/EntityFunctions'
import { unloadPrefab } from '../functions/loaders/PrefabComponentFunctions'

export enum LoadState {
  UNLOADED = 'unloaded',
  LOADING = 'loading',
  LOADED = 'loaded'
}

export const SCENE_COMPONENT_PREFAB = 'prefab'

export const PrefabComponent = defineComponent({
  name: 'PrefabComponent',

  onInit: (entity) => ({
    src: '',
    loaded: LoadState.UNLOADED as LoadState,
    roots: [] as Entity[],
    dirty: false
  }),

  onSet: (entity, component, json) => {
    if (!json) return
    matches.boolean.test(json.dirty) && component.dirty.set(json.dirty)
    ;(matches.string as Validator<unknown, LoadState>).test(json.loaded) && component.loaded.set(json.loaded)
    matches.arrayOf(matchesEntity).test(json.roots) && component.roots.set(json.roots)
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
