import { useEffect } from 'react'
import matches, { Validator } from 'ts-matches'

import { matchesEntity } from '../../common/functions/MatchesUtils'
import { Entity } from '../../ecs/classes/Entity'
import { defineComponent, getComponent, hasComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { loadPrefab, unloadPrefab } from '../functions/loaders/PrefabComponentFunctions'

export enum LoadState {
  UNLOADED = 'unloaded',
  LOADING = 'loading',
  LOADED = 'loaded'
}

export const PrefabComponent = defineComponent({
  name: 'PrefabComponent',
  jsonID: 'prefab',

  onInit: (entity) => ({
    src: '',
    loaded: LoadState.UNLOADED as LoadState,
    roots: [] as Entity[],
    dirty: false
  }),

  onSet: (entity, component, json) => {
    if (!json) return
    matches.boolean.test(json.dirty) && component.dirty.set(json.dirty)
    matches.arrayOf(matchesEntity).test(json.roots) && component.roots.set(json.roots)
    matches.string.test(json.src) && component.src.set(json.src)
  },

  toJSON: (entity, component) => {
    return {
      src: component.src.value
    }
  },

  onRemove: unloadPrefab,

  reactor: function () {
    const entity = useEntityContext()
    const assemblyState = useComponent(entity, PrefabComponent)

    useEffect(() => {
      assemblyState.dirty.set(true)
      loadPrefab(entity),
        () => {
          unloadPrefab(entity)
        }
    }, [assemblyState.src])

    useEffect(() => {
      if (assemblyState.loaded.value === LoadState.LOADED) {
        assemblyState.dirty.set(false)
      }
    }, [assemblyState.loaded])
    return null
  }
})
