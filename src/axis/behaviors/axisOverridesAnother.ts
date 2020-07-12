import AxisValue from "../interfaces/AxisValue";
import AxisAlias from "../types/AxisAlias";
function actionOverridesAnother(actionQueueArray: AxisValue[], arrayPosOne: number, arrayPoseTwo: number): boolean {
  const actionToTest = actionQueueArray[arrayPosOne];
  const actionToTestAgainst = actionQueueArray[arrayPoseTwo];
  this._userInput.inputMap[actionToTest.axis]?.overrides?.forEach((axis: AxisAlias) => {
    if (axis === actionToTestAgainst.axis && actionToTest.value === actionToTestAgainst.value) {
      return true;
    }
  });
  return false;
}
