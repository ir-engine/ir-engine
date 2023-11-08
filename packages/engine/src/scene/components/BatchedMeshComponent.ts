import { useEffect } from 'react'
import { Mesh } from 'three'
import { convertToBatchedMesh } from '../../assets/classes/BatchedMesh'
import { defineComponent, getComponent, hasComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { iterateEntityNode } from '../../ecs/functions/EntityTree'
import { GroupComponent, addObjectToGroup } from './GroupComponent'

export const BatchedMeshComponent = defineComponent({
  name: 'BatchedMeshComponent',
  jsonID: 'batched-mesh',
  onInit: (entity) => ({
    active: false
  }),
  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.active === 'boolean') component.active.set(json.active)
  },
  toJSON: (entity, component) => ({
    active: component.active.value
  }),
  reactor: () => {
    const entity = useEntityContext()
    const batchedMeshComponent = useComponent(entity, BatchedMeshComponent)

    useEffect(() => {
      if (batchedMeshComponent.active.value) {
        //iterate children of this entity and add them to the batch
        const meshes: Mesh[] = iterateEntityNode(
          entity,
          (childEntity) => getComponent(entity, GroupComponent)[0] as unknown as Mesh,
          (childEntity) => {
            if (!hasComponent(childEntity, GroupComponent)) return false
            if (getComponent(childEntity, GroupComponent).length === 0) return false
            const mesh: Mesh = getComponent(childEntity, GroupComponent)[0] as unknown as Mesh
            if (!mesh.isMesh) return false
            return true
          },
          false
        )
        //create batched mesh from these meshes
        const batchedMesh = new Mesh()
        const result = convertToBatchedMesh(meshes)
        //add batched mesh to this entity's GroupComponent to be rendered
        addObjectToGroup(entity, result)
      }
    }, [batchedMeshComponent.active])

    return null
  }
})
