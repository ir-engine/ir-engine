import { useEffect } from 'react'
import { BoxGeometry, BoxHelper, Mesh, Scene } from 'three'

import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { getMutableState, none, useHookstate } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { matches } from '../../common/functions/MatchesUtils'
import { defineComponent, hasComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { RendererState } from '../../renderer/RendererState'
import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from '../functions/setObjectLayers'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'

const GLTF_PATH = '/static/editor/spawn-point.glb'

export const SpawnPointComponent = defineComponent({
  name: 'SpawnPointComponent',
  jsonID: 'spawn-point',

  onInit: (entity) => {
    return {
      permissionedUsers: [] as UserId[],
      helper: null as Scene | null,
      helperBox: null as BoxHelper | null
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.array.test(json.permissionedUsers)) component.permissionedUsers.set(json.permissionedUsers as any)
  },

  toJSON: (entity, component) => {
    return {
      permissionedUsers: component.permissionedUsers.value
    }
  },

  onRemove: (entity, component) => {
    if (component.helper.value) removeObjectFromGroup(entity, component.helper.value)
  },

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)
    const spawnPoint = useComponent(entity, SpawnPointComponent)

    useEffect(() => {
      if (debugEnabled.value && !spawnPoint.helper.value) {
        AssetLoader.loadAsync(GLTF_PATH).then(({ scene: spawnPointHelperModel }) => {
          const helper = spawnPointHelperModel.clone()
          helper.name = `spawn-point-helper-${entity}`
          const helperBox = new BoxHelper(new Mesh(new BoxGeometry(1, 0, 1)), 0xffffff)
          helper.userData.helperBox = helperBox
          helper.add(helperBox)
          setObjectLayers(helper, ObjectLayers.NodeHelper)
          addObjectToGroup(entity, helper)
          spawnPoint.helper.set(helper)
        })
      }

      if (!debugEnabled.value && spawnPoint.helper.value) {
        removeObjectFromGroup(entity, spawnPoint.helper.value)
        spawnPoint.helper.set(none)
      }
    }, [debugEnabled])

    return null
  }
})
