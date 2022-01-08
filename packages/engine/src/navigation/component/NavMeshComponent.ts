import { Object3D } from 'three'
import { NavMesh } from 'yuka'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

/**
 * @author xiani_zp <github.com/xiani>
 */

export type NavMeshComponentType = {
  yukaNavMesh?: NavMesh
  navTarget: Object3D
}

export const NavMeshComponent = createMappedComponent<NavMeshComponentType>('NavMeshComponent')
