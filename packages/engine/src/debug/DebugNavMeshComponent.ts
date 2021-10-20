import { Group } from 'three'
import { createMappedComponent } from '../ecs/functions/ComponentFunctions'

export const DebugNavMeshComponent = createMappedComponent<{ object3d: Group }>('DebugNavMeshComponent')
