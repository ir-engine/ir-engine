import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { NavMesh } from '../classes/NavMesh'

export type NavMeshComponentType = {
  value: NavMesh
  // TODO get rid of debugMode property
  /** @deprecated don't use */
  debugMode: Boolean
}

export const NavMeshComponent = createMappedComponent<NavMeshComponentType>('NavMeshComponent')
