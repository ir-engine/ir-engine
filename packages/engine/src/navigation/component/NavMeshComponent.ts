import { NavMesh } from 'yuka'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

/**
 * @author xiani_zp <github.com/xiani>
 */

export type NavMeshComponentType = {
  yukaNavMesh: NavMesh
}

export const NavMeshComponent = createMappedComponent<NavMeshComponentType>()
