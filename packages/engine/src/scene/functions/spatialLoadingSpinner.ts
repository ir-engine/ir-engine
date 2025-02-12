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

import { getComponent, getOptionalComponent, setComponent, UndefinedEntity } from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { LookAtComponent } from '@ir-engine/spatial/src/transform/components/LookAtComponent'
import { TweenComponent } from '@ir-engine/spatial/src/transform/components/TweenComponent'
import { Tween } from '@tweenjs/tween.js'
import { CircleGeometry, DoubleSide, Euler, Mesh, MeshBasicMaterial, RingGeometry, Vector3 } from 'three'
import { SourceComponent } from '../components/SourceComponent'
import { addMesh } from './addMesh'
import { createSceneEntity } from './createSceneEntity'

export function createLoadingSpinner(name = 'loading spinner', parentEntity = UndefinedEntity) {
  const rootEntity = createSceneEntity(name)
  if (parentEntity) {
    setComponent(rootEntity, SourceComponent, getComponent(parentEntity, SourceComponent))
    const entityTree = getOptionalComponent(parentEntity, EntityTreeComponent)
    if (entityTree && entityTree.parentEntity) {
      setComponent(rootEntity, EntityTreeComponent, { parentEntity: entityTree.parentEntity })
      setComponent(rootEntity, TransformComponent, getComponent(parentEntity, TransformComponent))
    }
  }
  const childEntity = createSceneEntity(`${name}: loading spinner child`, rootEntity)
  const spinnerEntity = createSceneEntity(`${name}: spinner`, childEntity)
  const sphereEntity = createSceneEntity(`${name}: background`, childEntity)
  setComponent(spinnerEntity, TransformComponent, { position: new Vector3(0, 0, 0.1) })
  const loadingRing = new RingGeometry(0.55, 0.8, 32, 1, 0, (Math.PI * 4) / 3)
  const loadingSphere = new CircleGeometry(0.8, 64)
  const sphereMesh = new Mesh(
    loadingSphere,
    new MeshBasicMaterial({ side: DoubleSide, depthTest: false, color: 0xb2b5bd })
  )
  const spinnerMesh = new Mesh(loadingRing, new MeshBasicMaterial({ side: DoubleSide, depthTest: false }))

  addMesh(spinnerEntity, spinnerMesh)
  addMesh(sphereEntity, sphereMesh)
  const loadingTransform = getComponent(childEntity, TransformComponent)
  const rotator = { rotation: 0 }
  setComponent(
    childEntity,
    TweenComponent,
    new Tween<any>(rotator)
      .to({ rotation: Math.PI * 2 }, 1000)
      .onUpdate(() => {
        loadingTransform.rotation.setFromEuler(new Euler(0, 0, rotator.rotation))
      })
      .start()
      .repeat(Infinity)
  )

  setComponent(rootEntity, LookAtComponent)
  return rootEntity
}
