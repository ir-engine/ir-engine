/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { ArrowHelper } from 'three'

import { defineComponent, useComponent, useEntityContext } from '@ir-engine/ecs'
import { useDidMount } from '@ir-engine/hyperflux'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useDisposable } from '../../resources/resourceHooks'
import { T } from '../../schema/schemaFunctions'
import { useHelperEntity } from './DebugComponentUtils'

export const ArrowHelperComponent = defineComponent({
  name: 'ArrowHelperComponent',

  schema: S.Object({
    name: S.String('arrow-helper'),
    dir: T.Vec3({ x: 0, y: 0, z: 1 }),
    origin: T.Vec3({ x: 0, y: 0, z: 0 }),
    length: S.Number(0.5),
    color: T.Color(0xffffff),
    headLength: S.Optional(S.Number()),
    headWidth: S.Optional(S.Number()),
    entity: S.Optional(T.Entity())
  }),

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, ArrowHelperComponent)
    const [helper] = useDisposable(
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
    useHelperEntity(entity, component, helper)

    useDidMount(() => {
      helper.setDirection(component.dir.value)
      helper.setColor(component.color.value)
      helper.setLength(component.length.value, component.headLength.value, component.headWidth.value)
    }, [component.dir, component.length, component.color, component.headLength, component.headWidth])

    return null
  }
})
