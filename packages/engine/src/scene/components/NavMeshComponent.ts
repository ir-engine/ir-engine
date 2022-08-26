import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { NavMesh } from '../classes/NavMesh'

export type NavMeshComponentType = {
  value: NavMesh
}

export const NavMeshComponent = createMappedComponent<NavMeshComponentType>('NavMeshComponent')
