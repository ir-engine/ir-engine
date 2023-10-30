import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { SceneState } from '../../src/ecs/classes/Scene'
import { setComponent } from '../../src/ecs/functions/ComponentFunctions'
import { createEntity } from '../../src/ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '../../src/ecs/functions/EntityTree'
import { NameComponent } from '../../src/scene/components/NameComponent'
import { SceneObjectComponent } from '../../src/scene/components/SceneObjectComponent'
import { SceneTagComponent } from '../../src/scene/components/SceneTagComponent'
import { UUIDComponent } from '../../src/scene/components/UUIDComponent'
import { VisibleComponent } from '../../src/scene/components/VisibleComponent'
import { SceneID } from '../../src/schemas/projects/scene.schema'
import { TransformComponent } from '../../src/transform/components/TransformComponent'

export const loadEmptyScene = () => {
  SceneState.loadScene('test' as SceneID, {
    name: '',
    thumbnailUrl: '',
    project: '',
    scene: {
      entities: {
        ['root' as EntityUUID]: {
          name: 'Root',
          components: []
        }
      },
      version: 0,
      root: 'root' as EntityUUID
    }
  })
  const entity = createEntity()
  setComponent(entity, NameComponent, 'Root')
  setComponent(entity, VisibleComponent, true)
  setComponent(entity, UUIDComponent, 'root' as EntityUUID)
  setComponent(entity, SceneTagComponent, true)
  setComponent(entity, TransformComponent)
  setComponent(entity, SceneObjectComponent)
  setComponent(entity, EntityTreeComponent, { parentEntity: null })
}
