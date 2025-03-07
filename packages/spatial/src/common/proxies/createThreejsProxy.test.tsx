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

import { createEntity, defineComponent, destroyEngine, getComponent, setComponent } from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import { ECSSchema } from '@ir-engine/ecs/src/schemas/ECSSchemas'
import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { Vec3Proxy } from './createThreejsProxy'

describe('createThreejsProxy', () => {
  beforeEach(async () => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Creates a Vec3 proxy', () => {
    const TransformComponent = defineComponent({
      name: 'Vector3Component',
      schema: {
        position: ECSSchema.Vec3
      }
    })

    const entity = createEntity()
    setComponent(entity, TransformComponent)
    const transformComponent = getComponent(entity, TransformComponent)
    const vec3 = Vec3Proxy(transformComponent.position)

    vec3.x = 12
    assert(vec3.x === 12)
    assert(transformComponent.position.x === 12)
    assert(TransformComponent.position.x[entity] === 12)

    transformComponent.position.x = 13
    assert((vec3.x as number) === 13)
    assert((transformComponent.position.x as number) === 13)
    assert((TransformComponent.position.x[entity] as number) === 13)

    TransformComponent.position.x[entity] = 14
    assert((vec3.x as number) === 14)
    assert((transformComponent.position.x as number) === 14)
    assert((TransformComponent.position.x[entity] as number) === 14)
  })
})
