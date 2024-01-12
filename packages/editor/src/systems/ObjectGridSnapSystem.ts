import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import {
  defineQuery,
  getComponent,
  getOptionalComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeComponent } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { ObjectGridSnapComponent } from '@etherealengine/engine/src/scene/components/ObjectGridSnapComponent'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { TransformSystem } from '@etherealengine/engine/src/transform/systems/TransformSystem'
import { getState } from '@etherealengine/hyperflux'
import { Box3, Matrix4, Quaternion, Vector3 } from 'three'
import { SelectionState } from '../services/SelectionServices'

const objectGridQuery = defineQuery([ObjectGridSnapComponent])

function isParentSelected(entity: Entity) {
  let walker: Entity | null = entity
  const selectedEntities = getState(SelectionState).selectedEntities
  while (walker) {
    if (selectedEntities.includes(walker)) return walker
    walker = getOptionalComponent(walker, EntityTreeComponent)?.parentEntity ?? null
  }
  return false
}

function bboxDistance(bbox1: Box3, bbox2: Box3, matrixWorld1: Matrix4, matrixWorld2: Matrix4) {
  // Transform bbox1 corners to the local space of bbox2
  let min1Transformed = bbox1.min.clone().applyMatrix4(matrixWorld1).applyMatrix4(matrixWorld2.clone().invert())
  let max1Transformed = bbox1.max.clone().applyMatrix4(matrixWorld1).applyMatrix4(matrixWorld2.clone().invert())
  bbox1.getSize(max1Transformed)

  // Compute the distances in each dimension
  const distanceX = Math.max(min1Transformed.x - bbox2.max.x, bbox2.min.x - max1Transformed.x, 0)
  const distanceY = Math.max(min1Transformed.y - bbox2.max.y, bbox2.min.y - max1Transformed.y, 0)
  const distanceZ = Math.max(min1Transformed.z - bbox2.max.z, bbox2.min.z - max1Transformed.z, 0)

  // Calculate the total distance
  return Math.sqrt(distanceX * distanceX + distanceY * distanceY + distanceZ * distanceZ)
}

function getAxes(matrix: Matrix4) {
  const forward = new Quaternion().setFromRotationMatrix(matrix)
  const up = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), new Vector3(0, 1, 0)).multiply(forward)
  const right = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), new Vector3(1, 0, 0)).multiply(forward)
  const down = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), new Vector3(0, -1, 0)).multiply(forward)
  const left = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), new Vector3(-1, 0, 0)).multiply(forward)
  const back = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), new Vector3(0, 0, -1)).multiply(forward)
  return [forward, up, right, down, left, back]
}

function alignToClosestAxis(matrix1: Matrix4, matrix2: Matrix4) {
  const forward = new Quaternion().setFromRotationMatrix(matrix1)
  let minAngle = Infinity
  let minOrientation = new Quaternion()
  let srcOrientation = new Quaternion()
  const srcAxes = getAxes(matrix1)
  const dstAxes = getAxes(matrix2)
  for (const srcAxis of srcAxes) {
    for (const dstAxis of dstAxes) {
      const angle = dstAxis.angleTo(srcAxis)
      if (angle < minAngle) {
        minAngle = angle
        minOrientation = dstAxis
        srcOrientation = srcAxis
      }
    }
  }
  const rotationQuaternion = minOrientation.multiply(srcOrientation.clone().invert())
  return new Matrix4().makeRotationFromQuaternion(rotationQuaternion)
}

let lastExecution = 0

export const ObjectGridSnapSystem = defineSystem({
  uuid: 'ee.engine.scene.ObjectGridSnapSystem',
  insert: { before: TransformSystem },
  execute: () => {
    if (Date.now() - lastExecution < 100) return
    lastExecution = Date.now()
    const entities = objectGridQuery()
    const selectedEntities: Entity[] = []
    const selectedParents: Entity[] = []
    const nonSelectedEntities: Entity[] = []
    for (const entity of entities) {
      const parent = isParentSelected(entity)
      if (parent) {
        selectedEntities.push(entity)
        selectedParents.push(parent)
      } else {
        nonSelectedEntities.push(entity)
      }
    }
    if (selectedEntities.length === 0) return
    for (let i = 0; i < selectedEntities.length; i++) {
      const selectedEntity = selectedEntities[i]
      const selectedParent = selectedParents[i]
      for (const candidateEntity of nonSelectedEntities) {
        const selectedBBox = getComponent(selectedEntity, ObjectGridSnapComponent).bbox
        const selectedMatrixWorld = getComponent(selectedEntity, TransformComponent).matrixWorld
        const candidateBBox = getComponent(candidateEntity, ObjectGridSnapComponent).bbox
        const candidateMatrixWorld = getComponent(candidateEntity, TransformComponent).matrixWorld
        const distance = bboxDistance(selectedBBox, candidateBBox, selectedMatrixWorld, candidateMatrixWorld)
        if (distance < 1) {
          console.log('snap')
          const parentMatrixWorld = getComponent(selectedParent, TransformComponent).matrixWorld
          const rotationMatrix = alignToClosestAxis(selectedMatrixWorld, candidateMatrixWorld)
          parentMatrixWorld.copy(rotationMatrix.multiply(parentMatrixWorld))
          TransformComponent.updateFromWorldMatrix(selectedParent)
        }
      }
    }
  }
})
