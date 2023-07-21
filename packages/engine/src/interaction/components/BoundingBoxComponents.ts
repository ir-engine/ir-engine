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
import { Box3, Box3Helper, Group } from 'three'

import { getMutableState, none, useHookstate } from '@etherealengine/hyperflux'

import { matches } from '../../common/functions/MatchesUtils'
import { defineComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
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
