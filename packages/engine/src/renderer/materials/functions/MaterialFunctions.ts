import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { MaterialComponentType } from '../components/MaterialComponent'

export const deserializeMaterial: ComponentDeserializeFunction = (entity: Entity, data: MaterialComponentType) => {}

export const updateMaterial: ComponentUpdateFunction = (entity: Entity) => {}

export const serializeMaterial: ComponentSerializeFunction = (entity: Entity) => {}
