import { useEffect } from 'react'
import { Box3, Box3Helper } from 'three'

import { getState, none, useHookstate } from '@etherealengine/hyperflux'

import { matches } from '../../common/functions/MatchesUtils'
import { Entity } from '../../ecs/classes/Entity'
import {
  defineComponent,
  getComponent,
  hasComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { RendererState } from '../../renderer/RendererState'
import { addObjectToGroup, removeObjectFromGroup } from '../../scene/components/GroupComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'

export const BoundingBoxComponent = defineComponent({
  name: 'BoundingBoxComponent',

  onInit: (entity) => {
    return {
      box: new Box3(),
      helper: null as Box3Helper | null
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.array.test(json.box)) component.box.value.copy(json.box)
  },

  onRemove: (entity, component) => {
    if (component.helper.value) removeObjectFromGroup(entity, component.helper.value)
  },

  reactor: function ({ root }) {
    if (!hasComponent(root.entity, BoundingBoxComponent)) throw root.stop()

    const debugEnabled = useHookstate(getState(RendererState).debugEnable)
    const boundingBox = useComponent(root.entity, BoundingBoxComponent)

    useEffect(() => {
      if (!boundingBox) return
      if (debugEnabled.value && !boundingBox.helper.value) {
        const helper = new Box3Helper(boundingBox.box.value)
        helper.name = `bounding-box-helper-${root.entity}`
        setObjectLayers(helper, ObjectLayers.NodeHelper)
        addObjectToGroup(root.entity, helper)
        boundingBox.helper.set(helper)
      }

      if (!debugEnabled.value && boundingBox.helper.value) {
        removeObjectFromGroup(root.entity, boundingBox.helper.value)
        boundingBox.helper.set(none)
      }
    }, [debugEnabled])

    return null
  }
})

export const BoundingBoxDynamicTag = defineComponent({ name: 'BoundingBoxDynamicTag' })

export function setBoundingBoxComponent(entity: Entity) {
  if (hasComponent(entity, BoundingBoxComponent)) return getComponent(entity, BoundingBoxComponent)
  return setComponent(entity, BoundingBoxComponent)
}

export function setBoundingBoxDynamicTag(entity: Entity) {
  return setComponent(entity, BoundingBoxDynamicTag, true)
}
