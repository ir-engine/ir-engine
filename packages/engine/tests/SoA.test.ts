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

import { afterEach, beforeEach, describe, it } from 'vitest'
import assert from 'assert'

import { getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { createEntity } from '@ir-engine/ecs/src/EntityFunctions'
import { proxifyQuaternion, proxifyVector3 } from '@ir-engine/spatial/src/common/proxies/createThreejsProxy'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

describe('Structure of Array Synchronization', () => {
  beforeEach(() => {
    createEngine()
  })

  it('should synchronize values between transform objects and SoA data', () => {
    /* mock */

    const entity = createEntity()
    setComponent(entity, TransformComponent, {
      position: proxifyVector3(TransformComponent.position, entity).set(1, 2, 3),
      rotation: proxifyQuaternion(TransformComponent.rotation, entity).set(1, 2, 3, 4)
    })
    const transform = getComponent(entity, TransformComponent)

    /* assert */
    assert.strictEqual(transform.position.x, TransformComponent.position.x[entity])
    assert.strictEqual(transform.position.y, TransformComponent.position.y[entity])
    assert.strictEqual(transform.position.z, TransformComponent.position.z[entity])

    assert.strictEqual(transform.rotation.x, TransformComponent.rotation.x[entity])
    assert.strictEqual(transform.rotation.y, TransformComponent.rotation.y[entity])
    assert.strictEqual(transform.rotation.z, TransformComponent.rotation.z[entity])
    assert.strictEqual(transform.rotation.w, TransformComponent.rotation.w[entity])
  })

  afterEach(() => {
    return destroyEngine()
  })
})
