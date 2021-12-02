import { Color } from 'three'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { FogComponent, FogComponentType } from '../components/FogComponent'

export const setFog = (entity, componentData: FogComponentType) => {
  addComponent(entity, FogComponent, {
    ...componentData,
    color: new Color(componentData.color),
    dirty: true
  })
}
