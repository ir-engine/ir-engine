import { Group } from 'three'

import { ComponentDeserializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, setComponent } from '../../../ecs/functions/ComponentFunctions'
import { GroupComponent } from '../../components/GroupComponent'
import { Object3DComponent } from '../../components/Object3DComponent'

export const deserializeGroup: ComponentDeserializeFunction = (entity: Entity) => {
  setComponent(entity, GroupComponent, true)
  let obj3d = getComponent(entity, Object3DComponent)?.value
  if (!obj3d) {
    addComponent(entity, Object3DComponent, { value: new Group() })
  }
}
