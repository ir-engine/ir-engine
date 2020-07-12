import { Entity } from "ecsy"
import Axis from "../components/Axis"
import Behavior from "../../common/interfaces/Behavior"
import AxisValue from "../interfaces/AxisValue"
import AxisAlias from "../types/AxisAlias"
import BinaryValue from "../../common/enums/BinaryValue"
import { Vector3, Vector2, Scalar } from "../../common/types/NumericalTypes"
import RingBuffer from "../../common/classes/RingBuffer"

let axis: Axis
// Todo: Replace queue with map so we can simplify this

export const validateButtonAxes: Behavior = (entityIn: Entity): void => {
  axis = entityIn.getComponent(Axis)
  for (let i = 0; i < axis.values.getSize(); i++) {
    for (let k = 0; k < axis.values.getSize(); k++) {
      if (i == k) continue // don't compare to self
      // Opposing axes cancel out
      if (buttonsOpposeEachOther(axis.values, i, k)) {
        entityIn.getMutableComponent(Axis).values.remove(i)
        entityIn.getMutableComponent(Axis).values.remove(k)
      }
      // If axis is blocked by another axis that overrides and is active, remove this axis
      else if (buttonIsBlockedByAnother(axis.values, i, k)) {
        entityIn.getMutableComponent(Axis).values.remove(i)
      }
      // Override axes override
      else if (buttonOverridesAnother(axis.values, i, k)) {
        entityIn.getMutableComponent(Axis).values.remove(k)
      }
    }
  }
}

// If they oppose, cancel them
function buttonsOpposeEachOther(
  actionQueueArray: RingBuffer<AxisValue<BinaryValue | Scalar | Vector2 | Vector3>>,
  arrayPosOne: number,
  arrayPoseTwo: number
): boolean {
  const actionToTest = actionQueueArray[arrayPosOne]
  const actionToTestAgainst = actionQueueArray[arrayPoseTwo]
  this._userInput.inputMap[actionToTest.axis]?.opposes?.forEach((axis: AxisAlias) => {
    if (axis === actionToTestAgainst.axis && actionToTest.value === actionToTestAgainst.value) {
      // If values are both active, cancel each other out
      return true
    }
  })
  return false
}

function buttonIsBlockedByAnother(actionQueueArray: AxisValue<BinaryValue>[], arrayPosOne: number, arrayPoseTwo: number): boolean {
  const actionToTest = actionQueueArray[arrayPosOne]
  const actionToTestAgainst = actionQueueArray[arrayPoseTwo]
  this._userInput.inputMap[actionToTest.type]?.blockedBy?.forEach((axis: AxisAlias) => {
    if (axis === actionToTestAgainst.type && actionToTest.value === actionToTestAgainst.value) {
      // If values are both active, cancel each other out
      return true
    }
  })
  return false
}

function buttonOverridesAnother(actionQueueArray: AxisValue<BinaryValue>[], arrayPosOne: number, arrayPoseTwo: number): boolean {
  const actionToTest = actionQueueArray[arrayPosOne]
  const actionToTestAgainst = actionQueueArray[arrayPoseTwo]
  this._userInput.inputMap[actionToTest.type]?.overrides?.forEach((axis: AxisAlias) => {
    if (axis === actionToTestAgainst.type && actionToTest.value === actionToTestAgainst.value) {
      return true
    }
  })
  return false
}
