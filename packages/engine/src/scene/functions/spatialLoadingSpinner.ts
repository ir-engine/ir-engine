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
