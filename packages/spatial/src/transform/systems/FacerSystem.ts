import { Engine, Entity, UUIDComponent, defineQuery, defineSystem, getComponent } from '@etherealengine/ecs'
import { Matrix4, Quaternion, Vector3 } from 'three'
import { FacerComponent } from '../components/FacerComponent'
import { TransformComponent } from '../components/TransformComponent'
import { TransformSystem } from './TransformSystem'

const facerQuery = defineQuery([FacerComponent, TransformComponent])
const srcPosition = new Vector3()
const dstPosition = new Vector3()
const up = new Vector3(0, 1, 0)
const lookMatrix = new Matrix4()
const lookRotation = new Quaternion()

export const FacerSystem = defineSystem({
  uuid: 'ir.spatial.FacerSystem',
  insert: { before: TransformSystem },
  execute: () => {
    const viewerEntity = Engine.instance.viewerEntity
    for (const entity of facerQuery()) {
      const facer = getComponent(entity, FacerComponent)
      const targetEntity: Entity | null = facer.target ? UUIDComponent.getEntityByUUID(facer.target) : viewerEntity
      if (!targetEntity) continue
      TransformComponent.getWorldPosition(entity, srcPosition)
      TransformComponent.getWorldPosition(targetEntity, dstPosition)
      lookMatrix.lookAt(srcPosition, dstPosition, up)
      lookRotation.setFromRotationMatrix(lookMatrix)
      TransformComponent.setWorldRotation(entity, lookRotation)
      TransformComponent.updateFromWorldMatrix(entity)
    }
  }
})
