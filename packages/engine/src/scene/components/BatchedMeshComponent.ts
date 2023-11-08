import { useEffect } from 'react'
import { Mesh } from 'three'
import { convertToBatchedMesh } from '../../assets/classes/BatchedMesh'
import { defineComponent, getComponent, hasComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { iterateEntityNode } from '../../ecs/functions/EntityTree'
import iterateObject3D from '../util/iterateObject3D'
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
          (childEntity) => {
            const scene = getComponent(childEntity, GroupComponent)[0]!
            return iterateObject3D(
              scene,
              (object) => object as Mesh,
              (object) => (object as Mesh).isMesh,
              false,
              false
            )
          },
          (childEntity) => {
            if (!hasComponent(childEntity, GroupComponent)) return false
            if (getComponent(childEntity, GroupComponent).length === 0) return false
            return true
          },
          false
        ).flat()
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
