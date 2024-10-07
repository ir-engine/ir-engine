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

import { getComponent, setComponent, UndefinedEntity } from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial'
import { mergeBufferGeometries } from '@ir-engine/spatial/src/common/classes/BufferGeometryUtils'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { setObjectLayers } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { TweenComponent } from '@ir-engine/spatial/src/transform/components/TweenComponent'
import { Tween } from '@tweenjs/tween.js'
import { DoubleSide, Euler, Mesh, MeshBasicMaterial, RingGeometry, SphereGeometry } from 'three'
import { createSceneEntity } from './createSceneEntity'
import { proxifyParentChildRelationships } from './loadGLTFModel'

export function createLoadingSpinner(name = 'loading spinner', parentEntity = UndefinedEntity) {
  const spinnerEntity = createSceneEntity(name, parentEntity)
  const loadingRing = new RingGeometry(0.75, 0.5, 32, 1, 0, (Math.PI * 4) / 3)
  const loadingSphere = new SphereGeometry(0.25, 25, 32, 32)
  const loadingGeo = mergeBufferGeometries([loadingRing, loadingSphere])!
  const mesh = new Mesh(loadingGeo, new MeshBasicMaterial({ side: DoubleSide, depthTest: false }))
  setComponent(spinnerEntity, MeshComponent, mesh)
  addObjectToGroup(spinnerEntity, mesh)
  proxifyParentChildRelationships(mesh)
  setObjectLayers(mesh, ObjectLayers.Scene)
  const loadingTransform = getComponent(spinnerEntity, TransformComponent)
  const rotator = { rotation: 0 }
  setComponent(
    spinnerEntity,
    TweenComponent,
    new Tween<any>(rotator)
      .to({ rotation: Math.PI * 2 }, 1000)
      .onUpdate(() => {
        loadingTransform.rotation.setFromEuler(new Euler(0, 0, rotator.rotation))
      })
      .start()
      .repeat(Infinity)
  )
  return spinnerEntity
}
