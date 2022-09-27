import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { setComponent } from '../../../ecs/functions/ComponentFunctions'
import {
  MaterialPrototypeComponent,
  MaterialPrototypeComponentType,
  RENDER_COMPONENT_MATERIAL_PROTOTYPE_DEFAULT_VALUES
} from '../components/MaterialPrototypeComponent'

export const deserializeMaterialPrototype: ComponentDeserializeFunction = (
  entity: Entity,
  componentData: MaterialPrototypeComponentType
) => {
  const props = parseMaterialPrototypeProperties(componentData)
  setComponent(entity, MaterialPrototypeComponent, props)
}

function parseMaterialPrototypeProperties(data): MaterialPrototypeComponentType {
  return { ...RENDER_COMPONENT_MATERIAL_PROTOTYPE_DEFAULT_VALUES, ...data }
}

export const updateMaterialPrototype: ComponentUpdateFunction = (entity: Entity) => {}

export const serializeMaterialPrototype: ComponentSerializeFunction = (entity: Entity) => {}
