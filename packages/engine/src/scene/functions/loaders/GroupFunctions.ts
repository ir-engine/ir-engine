import { ComponentDeserializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { GroupComponent } from '../../components/GroupComponent'

export const deserializeGroup: ComponentDeserializeFunction = (entity: Entity) => {
  if (!hasComponent(entity, GroupComponent)) addComponent(entity, GroupComponent, [])
}
