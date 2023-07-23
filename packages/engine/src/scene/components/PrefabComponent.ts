/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { useEffect } from 'react'
import matches from 'ts-matches'

import { matchesEntity } from '../../common/functions/MatchesUtils'
import { Entity } from '../../ecs/classes/Entity'
import { defineComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
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
