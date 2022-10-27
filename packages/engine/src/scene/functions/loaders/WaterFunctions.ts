import { ComponentDeserializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, ComponentType, setComponent } from '../../../ecs/functions/ComponentFunctions'
import { Water } from '../../classes/Water'
import { setCallback } from '../../components/CallbackComponent'
import { addObjectToGroup } from '../../components/GroupComponent'
import { UpdatableCallback, UpdatableComponent } from '../../components/UpdatableComponent'
import { WaterComponent } from '../../components/WaterComponent'

export const deserializeWater: ComponentDeserializeFunction = (entity: Entity) => {
  const { water } = setComponent(entity, WaterComponent, { water: new Water() }) as any as ComponentType<
    typeof WaterComponent
  >
  addObjectToGroup(entity, water)
  setCallback(entity, UpdatableCallback, (dt: number) => {
    water.update(dt)
  })
  addComponent(entity, UpdatableComponent, true)
}
