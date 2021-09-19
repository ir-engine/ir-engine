import { createMappedComponent } from '../ecs/functions/ComponentFunctions'
import { MapFeatureLabel } from './types'

export type ComponentType = {
  value: MapFeatureLabel
}

export default createMappedComponent<ComponentType>('MapFeatureLabel')
