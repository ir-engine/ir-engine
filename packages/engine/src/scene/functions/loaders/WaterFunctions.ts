import { ComponentDeserializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, setComponent } from '../../../ecs/functions/ComponentFunctions'
import { Water } from '../../classes/Water'
import { Object3DComponent } from '../../components/Object3DComponent'
import { UpdatableComponent } from '../../components/UpdatableComponent'
import { WaterComponent } from '../../components/WaterComponent'

export const deserializeWater: ComponentDeserializeFunction = (entity: Entity) => {
  setComponent(entity, WaterComponent, true)
  let obj3d = getComponent(entity, Object3DComponent)?.value
  if (!obj3d) {
    addComponent(entity, Object3DComponent, { value: new Water() })
    addComponent(entity, UpdatableComponent, true)
  }
}
