import { useEffect } from 'react'
import { Box3, Box3Helper, Group } from 'three'

import { getMutableState, none, useHookstate } from '@etherealengine/hyperflux'

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
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
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

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).debugEnable)
    const boundingBox = useComponent(entity, BoundingBoxComponent)

    useEffect(() => {
      if (!boundingBox) return
      if (debugEnabled.value && !boundingBox.helper.value) {
        const helper = new Box3Helper(boundingBox.box.value)
        helper.name = `bounding-box-helper-${entity}`
        // we need an intermediary group because otherwise the helper's updateMatrixWorld() modifies the enities transform
        const helperGroup = new Group()
        helperGroup.add(helper)
        setObjectLayers(helper, ObjectLayers.NodeHelper)
        addObjectToGroup(entity, helperGroup)
        boundingBox.helper.set(helper)
      }

      if (!debugEnabled.value && boundingBox.helper.value) {
        removeObjectFromGroup(entity, boundingBox.helper.value)
        boundingBox.helper.set(none)
      }
    }, [debugEnabled])

    return null
  }
})

export const BoundingBoxDynamicTag = defineComponent({ name: 'BoundingBoxDynamicTag' })
