import { Group } from 'three'

import { ComponentDeserializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { GroupComponent } from '../../components/GroupComponent'
import { Object3DComponent } from '../../components/Object3DComponent'

export const deserializeGroup: ComponentDeserializeFunction = (entity: Entity) => {
  addComponent(entity, GroupComponent, true)
  addComponent(entity, Object3DComponent, { value: new Group() })
}