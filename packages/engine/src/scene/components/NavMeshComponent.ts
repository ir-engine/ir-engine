import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { NavMesh } from '../classes/NavMesh'

export type NavMeshComponentType = {
  value: NavMesh
  debugMode: Boolean
}

export const NavMeshComponent = createMappedComponent<NavMeshComponentType>('NavMeshComponent')
