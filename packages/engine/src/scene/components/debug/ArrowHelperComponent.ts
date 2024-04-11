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

import {
  Entity,
  createEntity,
  defineComponent,
  removeEntity,
  setComponent,
  useComponent,
  useEntityContext
} from '@etherealengine/ecs'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { matchesColor, matchesVector3 } from '@etherealengine/spatial/src/common/functions/MatchesUtils'
import { addObjectToGroup, removeObjectFromGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { ObjectLayerMaskComponent } from '@etherealengine/spatial/src/renderer/components/ObjectLayerComponent'
import { setVisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { useEffect } from 'react'
import { ArrowHelper, ColorRepresentation, Vector3 } from 'three'
import { useObj } from '../../../assets/functions/resourceHooks'

export const ArrowHelperComponent = defineComponent({
  name: 'ArrowHelperComponent',

  onInit: (entity) => {
    return {
      name: 'arrow-helper',
      dir: new Vector3(0, 0, 1),
      origin: new Vector3(0, 0, 0),
      length: 0.5,
      color: 0xffffff as ColorRepresentation,
      headLength: undefined as undefined | number,
      headWidth: undefined as undefined | number,
      entity: undefined as undefined | Entity
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.name === 'string') component.name.set(json.name)
    if (matchesVector3.test(json.dir)) component.dir.set(json.dir)
    if (matchesVector3.test(json.origin)) component.origin.set(json.origin)
    if (typeof json.length === 'number') component.length.set(json.length)
    if (matchesColor.test(json.color)) component.color.set(json.color)
    if (typeof json.headLength === 'number') component.headLength.set(json.headLength)
    if (typeof json.headWidth === 'number') component.headWidth.set(json.headWidth)
  },

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, ArrowHelperComponent)
    const [helper] = useObj(
      ArrowHelper,
      entity,
      component.dir.value,
      // Origin value isn't updatable in ArrowHelper
      component.origin.value,
      component.length.value,
      component.color.value,
      component.headLength.value,
      component.headWidth.value
    )

    useEffect(() => {
      helper.setDirection(component.dir.value)
      helper.setColor(component.color.value)
      helper.setLength(component.length.value, component.headLength.value, component.headWidth.value)
    }, [component.dir, component.length, component.color, component.headLength, component.headWidth])

    useEffect(() => {
      helper.name = `${component.name.value}-${entity}`

      const helperEntity = createEntity()
      addObjectToGroup(helperEntity, helper)
      setComponent(helperEntity, NameComponent, helper.name)
      setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })
      setVisibleComponent(helperEntity, true)
      setComponent(helperEntity, ObjectLayerMaskComponent, ObjectLayers.NodeHelper)
      component.entity.set(helperEntity)

      return () => {
        removeObjectFromGroup(helperEntity, helper)
        removeEntity(helperEntity)
      }
    }, [])

    return null
  }
})
