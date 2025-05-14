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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { createEntity, defineComponent, destroyEngine, Entity, getComponent, S, setComponent } from '@ir-engine/ecs'
import { createResizableTypeArray } from '@ir-engine/ecs/src/bitecsLegacy'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import assert from 'assert'
import { Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { T } from '../../schema/schemaFunctions'
import { proxifyVector3 } from './createThreejsProxy'

describe('createThreejsProxy', () => {
  beforeEach(async () => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('proxifyVector3', () => {
    const assignVector3 = (entity: Entity): Vector3 => proxifyVector3(Vector3Component.position, entity)

    const Vector3Component = defineComponent({
      name: 'Vector3Component',
      schema: S.Object({
        position: T.Vec3(assignVector3)
      }),
      storage: {
        position: {
          x: createResizableTypeArray(Float64Array),
          y: createResizableTypeArray(Float64Array),
          z: createResizableTypeArray(Float64Array)
        }
      }
    })

    const entity = createEntity()
    setComponent(entity, Vector3Component)
    const component = getComponent(entity, Vector3Component)
    const vec3 = component.position

    assert(vec3.isVector3)

    vec3.x = 12
    assert.equal(vec3.x, 12)
    assert.equal(component.position.x, 12)
    assert.equal(Vector3Component.position.x[entity], 12)

    component.position.x = 13
    assert.equal(vec3.x, 13)
    assert.equal(component.position.x, 13)
    assert.equal(Vector3Component.position.x[entity], 13)

    Vector3Component.position.x[entity] = 14
    assert.equal(vec3.x, 14)
    assert.equal(component.position.x, 14)
    assert.equal(Vector3Component.position.x[entity], 14)
  })
})
