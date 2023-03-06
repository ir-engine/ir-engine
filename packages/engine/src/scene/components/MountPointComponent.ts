import { useEffect } from 'react'
import { ArrowHelper, Vector3 } from 'three'

import { getState, none, useHookstate } from '@etherealengine/hyperflux'

import { matches } from '../../common/functions/MatchesUtils'
import { defineComponent, hasComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { RendererState } from '../../renderer/RendererState'
import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from '../functions/setObjectLayers'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'

export const MountPoint = {
  seat: 'seat' as const
}

export type MountPointTypes = typeof MountPoint[keyof typeof MountPoint]

export const MountPointComponent = defineComponent({
  name: 'MountPointComponent',

  onInit: (entity) => {
    return {
      type: MountPoint.seat as MountPointTypes,
      helper: null as ArrowHelper | null
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.string.test(json.type)) component.type.set(json.type)
  },

  toJSON: (entity, component) => {
    return {
      type: component.type.value
    }
  },

  onRemove: (entity, component) => {
    if (component.helper.value) removeObjectFromGroup(entity, component.helper.value)
  },

  reactor: function ({ root }) {
    if (!hasComponent(root.entity, MountPointComponent)) throw root.stop()

    const debugEnabled = useHookstate(getState(RendererState).nodeHelperVisibility)
    const mountPoint = useComponent(root.entity, MountPointComponent)

    useEffect(() => {
      if (debugEnabled.value && !mountPoint.helper.value) {
        const helper = new ArrowHelper(new Vector3(0, 0, 1), new Vector3(0, 0, 0), 0.5, 0xffffff)
        helper.name = `mount-point-helper-${root.entity}`

        setObjectLayers(helper, ObjectLayers.NodeHelper)
        addObjectToGroup(root.entity, helper)

        mountPoint.helper.set(helper)
      }

      if (!debugEnabled.value && mountPoint.helper.value) {
        removeObjectFromGroup(root.entity, mountPoint.helper.value)
        mountPoint.helper.set(none)
      }
    }, [debugEnabled])

    return null
  }
})

export const SCENE_COMPONENT_MOUNT_POINT = 'mount-point'
