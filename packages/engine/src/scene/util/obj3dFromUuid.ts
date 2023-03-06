import { Engine } from '../../ecs/classes/Engine'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { GroupComponent } from '../components/GroupComponent'
import { UUIDComponent } from '../components/UUIDComponent'

export default function obj3dFromUuid(uuid: string) {
  const entity = UUIDComponent.entitiesByUUID[uuid].value
  if (!entity) {
    const result = Engine.instance.scene.getObjectByProperty('uuid', uuid)
    if (result) return result
    else throw Error('Error finding entity node with uuid ' + uuid)
  }
  if (!hasComponent(entity, GroupComponent)) {
    throw Error('Entity Node' + entity + 'does not have an GroupComponent')
  }
  return getComponent(entity, GroupComponent)[0]
}
