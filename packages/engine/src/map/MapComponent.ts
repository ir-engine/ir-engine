import { createMappedComponent } from '../ecs/functions/EntityFunctions'

export type MapComponentType = {
  coordinates: [number, number]
}

export const MapComponent = createMappedComponent<MapComponentType>()
