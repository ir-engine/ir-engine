import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent, setComponent } from '../../ecs/functions/ComponentFunctions'

export type NameComponentType = {
  name: string
}

export const NameComponent = createMappedComponent<NameComponentType>('NameComponent')

export const setNameComponent = (entity: Entity, name: string) => {
  setComponent(entity, NameComponent, { name })
}
