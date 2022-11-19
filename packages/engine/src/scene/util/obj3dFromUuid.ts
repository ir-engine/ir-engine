import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { getEntityTreeNodeByUUID } from '../../ecs/functions/EntityTree'
import { GroupComponent } from '../components/GroupComponent'

export default function obj3dFromUuid(uuid, world: World = Engine.instance.currentWorld) {
  const node = getEntityTreeNodeByUUID(uuid)
  if (!node) {
    const result = world.scene.getObjectByProperty('uuid', uuid)
    if (result) return result
    else throw Error('Error finding entity node with uuid ' + uuid)
  }
  if (!hasComponent(node.entity, GroupComponent)) {
    throw Error('Entity Node' + node + 'does not have an GroupComponent')
  }
  return getComponent(node.entity, GroupComponent)[0]
}
