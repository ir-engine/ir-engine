import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { Water } from '../../classes/Water'
import { Object3DComponent } from '../../components/Object3DComponent'
import { UpdatableComponent } from '../../components/UpdatableComponent'
import { WaterComponent } from '../../components/WaterComponent'

export const deserializeWater: ComponentDeserializeFunction = (entity: Entity) => {
  const obj3d = new Water()
  addComponent(entity, Object3DComponent, { value: obj3d })
  addComponent(entity, WaterComponent, true)
  addComponent(entity, UpdatableComponent, true)
}
