import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import {
  defineComponent,
  getComponent,
  useComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { useEntityContext } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { addWorldObjectToGroup } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { Box3, Color, Mesh, MeshStandardMaterial, SphereGeometry } from 'three'
import { useExecute } from '../../ecs/functions/SystemFunctions'
import { BoundingBoxComponent, computeBoundingBox } from '../../interaction/components/BoundingBoxComponents'
import { TransformSystem } from '../../transform/TransformModule'

export const ObjectGridSnapComponent = defineComponent({
  name: 'Object Grid Snap Component',
  jsonID: 'object-grid-snap',

  onInit: (entity) => {
    return {
      density: 1 as number,
      bbox: new Box3()
    }
  },
  onSet: (entity, component, json) => {
    if (!json) return
  },
  toJSON: (entity, component) => {
    return {
      density: component.density.value
    }
  },
  reactor: () => {
    const entity = useEntityContext()

    const snapComponent = useComponent(entity, ObjectGridSnapComponent)

    useExecute(
      () => {
        const testDot1 = new Mesh(new SphereGeometry(1), new MeshStandardMaterial())
        const testDot2 = new Mesh(new SphereGeometry(1), new MeshStandardMaterial())

        const boundingBoxComponent = getComponent(entity as Entity, BoundingBoxComponent)
        const objectSpaceBoundingBox = new Box3()
        const worldSpaceBoundingBox = boundingBoxComponent.box
        objectSpaceBoundingBox.copy(worldSpaceBoundingBox)
        const objectSpaceMatrix = getComponent(entity, TransformComponent).matrixInverse
        objectSpaceBoundingBox.applyMatrix4(objectSpaceMatrix)

        computeBoundingBox(entity)
        console.log(getComponent(entity, BoundingBoxComponent).box.max)
        console.log(getComponent(entity, BoundingBoxComponent).box.min)

        const min = objectSpaceBoundingBox.min
        const max = objectSpaceBoundingBox.max

        const testDot3 = new Mesh(new SphereGeometry(0.12), new MeshStandardMaterial())
        testDot3.material.color = new Color(0xd1f589)
        testDot3.position.copy(getComponent(entity, BoundingBoxComponent).box.max)
        addWorldObjectToGroup(entity, testDot3)
        const testDot4 = new Mesh(new SphereGeometry(0.12), new MeshStandardMaterial())
        testDot4.material.color = new Color(0xd1f589)
        testDot4.position.copy(getComponent(entity, BoundingBoxComponent).box.min)
        addWorldObjectToGroup(entity, testDot4)
      },
      { after: TransformSystem }
    )
    return null
  }
})
