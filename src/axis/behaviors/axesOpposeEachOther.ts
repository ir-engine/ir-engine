import AxisValue from "../interfaces/AxisValue"
import AxisAlias from "../types/AxisAlias"
// If they oppose, cancel them
function axesOpposeEachOther(actionQueueArray: AxisValue[], arrayPosOne: number, arrayPoseTwo: number): boolean {
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
