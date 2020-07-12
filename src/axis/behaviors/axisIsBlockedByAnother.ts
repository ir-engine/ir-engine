import AxisValue from "../interfaces/AxisValue"
import AxisAlias from "../types/AxisAlias"
function actionIsBlockedByAnother(actionQueueArray: AxisValue[], arrayPosOne: number, arrayPoseTwo: number): boolean {
  const actionToTest = actionQueueArray[arrayPosOne]
  const actionToTestAgainst = actionQueueArray[arrayPoseTwo]
  this._userInput.inputMap[actionToTest.axis]?.blockedBy?.forEach((axis: AxisAlias) => {
    if (axis === actionToTestAgainst.axis && actionToTest.value === actionToTestAgainst.value) {
      // If values are both active, cancel each other out
      return true
    }
  })
  return false
}
