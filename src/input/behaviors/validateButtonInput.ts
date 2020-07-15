// import { Entity } from "ecsy"
// import Input from "../components/Input"
// import Behavior from "../../common/interfaces/Behavior"
// import InputValue from "../interfaces/InputValue"
// import InputAlias from "../types/InputAlias"
// import BinaryValue from "../../common/enums/BinaryValue"
// import { Vector3, Vector2, Scalar } from "../../common/types/NumericalTypes"

// let input: Input
// // Todo: Replace queue with map so we can simplify this

// export const validateButtonInput: Behavior = (entity: Entity): void => {
//   input = entity.getComponent(Input)
//   for (let i = 0; i < input.values.getSize(); i++) {
//     for (let k = 0; k < input.values.getSize(); k++) {
//       if (i == k) continue // don't compare to self
//       // Opposing input cancel out
//       if (buttonsOpposeEachOther(input.values, i, k)) {
//         entity.getMutableComponent(Input).values.remove(i)
//         entity.getMutableComponent(Input).values.remove(k)
//       }
//       // If input is blocked by another input that overrides and is active, remove this input
//       else if (buttonIsBlockedByAnother(input.values, i, k)) {
//         entity.getMutableComponent(Input).values.remove(i)
//       }
//       // Override input override
//       else if (buttonOverridesAnother(input.values, i, k)) {
//         entity.getMutableComponent(Input).values.remove(k)
//       }
//     }
//   }
// }

// // If they oppose, cancel them
// function buttonsOpposeEachOther(
//   actionQueueArray: RingBuffer<InputValue<BinaryValue | Scalar | Vector2 | Vector3>>,
//   arrayPosOne: number,
//   arrayPoseTwo: number
// ): boolean {
//   const actionToTest = actionQueueArray[arrayPosOne]
//   const actionToTestAgainst = actionQueueArray[arrayPoseTwo]
//   this._userInput.inputMap[actionToTest.input]?.opposes?.forEach((input: InputAlias) => {
//     if (input === actionToTestAgainst.input && actionToTest.value === actionToTestAgainst.value) {
//       // If values are both active, cancel each other out
//       return true
//     }
//   })
//   return false
// }

// function buttonIsBlockedByAnother(actionQueueArray: InputValue<BinaryValue>[], arrayPosOne: number, arrayPoseTwo: number): boolean {
//   const actionToTest = actionQueueArray[arrayPosOne]
//   const actionToTestAgainst = actionQueueArray[arrayPoseTwo]
//   this._userInput.inputMap[actionToTest.type]?.blockedBy?.forEach((input: InputAlias) => {
//     if (input === actionToTestAgainst.type && actionToTest.value === actionToTestAgainst.value) {
//       // If values are both active, cancel each other out
//       return true
//     }
//   })
//   return false
// }

// function buttonOverridesAnother(actionQueueArray: InputValue<BinaryValue>[], arrayPosOne: number, arrayPoseTwo: number): boolean {
//   const actionToTest = actionQueueArray[arrayPosOne]
//   const actionToTestAgainst = actionQueueArray[arrayPoseTwo]
//   this._userInput.inputMap[actionToTest.type]?.overrides?.forEach((input: InputAlias) => {
//     if (input === actionToTestAgainst.type && actionToTest.value === actionToTestAgainst.value) {
//       return true
//     }
//   })
//   return false
// }
