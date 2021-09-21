import { createMappedComponent } from '../ecs/functions/ComponentFunctions'
import { Store } from './functions/createStore'

export const MapComponent = createMappedComponent<Store>('map')
