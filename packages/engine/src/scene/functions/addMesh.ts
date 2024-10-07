import { Entity, setComponent } from '@ir-engine/ecs'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { setObjectLayers } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { Mesh } from 'three'
import { proxifyParentChildRelationships } from './loadGLTFModel'

/**
 * Helper function for attaching a mesh to a scene entity
 * @param entity Entity to attach the mesh to
 * @param mesh Mesh to attach to the entity
 * @param objectLayers Object layers to assign to the mesh. Default is [ObjectLayers.Scene]
 */
export function addMesh(entity: Entity, mesh: Mesh, objectLayers: number[] = [ObjectLayers.Scene]) {
  setComponent(entity, MeshComponent, mesh)
  addObjectToGroup(entity, mesh)
  proxifyParentChildRelationships(mesh)
  setObjectLayers(mesh, ...objectLayers)
}
