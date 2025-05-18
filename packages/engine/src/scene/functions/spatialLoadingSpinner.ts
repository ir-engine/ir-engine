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

import { createEntity, EntityTreeComponent, getComponent, setComponent, UndefinedEntity } from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { TweenComponent } from '@ir-engine/spatial/src/transform/components/TweenComponent'
import { Tween } from '@tweenjs/tween.js'
import { DoubleSide, Euler, Mesh, MeshBasicMaterial, TorusGeometry } from 'three'

export function createLoadingSpinner(name = 'loading spinner', parentEntity = UndefinedEntity) {
  const sphereEntity = createEntity()
  setComponent(sphereEntity, NameComponent, name + ': helper')
  setComponent(sphereEntity, VisibleComponent)
  setComponent(sphereEntity, TransformComponent)
  setComponent(sphereEntity, EntityTreeComponent, { parentEntity })

  const sphereMesh = new Mesh(
    new TorusGeometry(1, 0.2, 16, 100, Math.PI * 1.5),
    new MeshBasicMaterial({ side: DoubleSide, depthTest: false, color: 0x0077ff })
  )
  setComponent(sphereEntity, MeshComponent, sphereMesh)

  const loadingTransform = getComponent(sphereEntity, TransformComponent)
  const rotator = { rotation: 0 }
  setComponent(
    sphereEntity,
    TweenComponent,
    new Tween<any>(rotator)
      .to({ rotation: Math.PI * 2 }, 1000)
      .onUpdate(() => {
        loadingTransform.rotation.setFromEuler(new Euler(0, 0, rotator.rotation))
      })
      .start()
      .repeat(Infinity)
  )

  return sphereEntity
}
