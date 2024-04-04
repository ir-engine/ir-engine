import {
  Entity,
  EntityUUID,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  getComponent,
  hasComponent,
  setComponent
} from '@etherealengine/ecs'
import { getState } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { Object3DComponent } from '@etherealengine/spatial/src/renderer/components/Object3DComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { Group, MathUtils } from 'three'
import { proxifyParentChildRelationships } from './loadGLTFModel'

import { SceneID } from '@etherealengine/common/src/schema.type.module'
import { SceneComponent } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import { SceneState } from '../SceneState'
import { SourceComponent } from '../components/SourceComponent'

export const createSceneEntity = (name: string, parentEntity: Entity = UndefinedEntity): Entity => {
  const entity = createEntity()
  setComponent(entity, NameComponent, name)
  setComponent(entity, VisibleComponent)
  setComponent(entity, TransformComponent)
  setComponent(entity, EntityTreeComponent, { parentEntity })
  let sceneID = Object.keys(getState(SceneState).scenes)[0] as SceneID
  if (hasComponent(parentEntity, SceneComponent)) {
    sceneID = getComponent(parentEntity, SourceComponent)
  }
  setComponent(entity, SourceComponent, sceneID)

  const uuid = MathUtils.generateUUID() as EntityUUID
  setComponent(entity, UUIDComponent, uuid)

  // These additional properties and relations are required for
  // the current GLTF exporter to successfully generate a GLTF.
  const obj3d = new Group()
  obj3d.entity = entity
  addObjectToGroup(entity, obj3d)
  proxifyParentChildRelationships(obj3d)
  setComponent(entity, Object3DComponent, obj3d)

  return entity
}
