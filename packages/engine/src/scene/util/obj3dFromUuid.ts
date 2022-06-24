import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../components/Object3DComponent'

export default function obj3dFromUuid(uuid, world: World = Engine.instance.currentWorld) {
  const idMap = world.entityTree.uuidNodeMap
  if (!idMap.has(uuid)) {
    console.error('Error finding entity node with uuid ' + uuid)
  }
  const node = idMap.get(uuid)!
  if (!hasComponent(node.entity, Object3DComponent)) {
    console.error('Entity Node', node, 'does not have an Object3DComponent')
  }
  return getComponent(node.entity, Object3DComponent).value
}
