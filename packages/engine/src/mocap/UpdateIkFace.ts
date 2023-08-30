/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

const UpdateRawFace = (data, hipsPos, avatarRig, avatarTransform) => {
  return null
  //   const faceData = data?.face[0]?.categories
  //   // console.log('faceData', faceData)
  //   // console.log('exp map', avatarRig?.vrm?.expressionManager?.expressionMap)
  //   for (let i = 0; i < faceData?.length - 1; i++) {
  //     const expName = faceData[i]?.categoryName.startsWith('_') ? `VRMExpression${faceData[i]?.categoryName}` : `VRMExpression_${faceData[i]?.categoryName}`
  //     // console.log('exp name: ', expName)
  //     let name = faceData[i]?.categoryName
  //     name = name.startsWith('_') ? name = name.slice(1) : name
  //     name = name.charAt(0).toUpperCase() + name.slice(1)
  //     // console.log('Cat name: ', expName)
  //     // const mapExp = avatarRig?.vrm?.expressionManager?.expressionMap[expName]
  //     // console.log('map - exp: ', mapExp)
  //     const map = avatarRig?.vrm?.expressionManager?.expressionMap[VRMExpressionPresetName[name]]
  //     const exp = avatarRig?.vrm?.expressionManager?.getExpression(VRMExpressionPresetName[name])
  //     const map2 = avatarRig?.vrm?.expressionManager?.expressionMap[VRMExpressionPresetName[expName]]
  //     const exp2 = avatarRig?.vrm?.expressionManager?.getExpression(VRMExpressionPresetName[expName])
  //     debugger
  //     // console.log('map - cat: ', map)
  //     // const expMap = avatarRig?.vrm?.expressionManager?.expressions.filter((c) => (c?.expressionName.toLowerCase() === expName.toLowerCase()))
  //     // console.log('exp', expMap)
  //     // const exp = avatarRig?.vrm?.expressionManager?.expressions.filter((c) => (c?.expressionName.toLowerCase() === name.toLowerCase()))
  //     // console.log('exp', exp)
  //     if (!map) continue
  //     // debugger
  //     // map.weight = faceData[i]?.score
  //     // map.applyWeight({ multiplier: faceData[i]?.score })
  //     const currentWeight = avatarRig?.vrm?.expressionManager?.getValue(VRMExpressionPresetName[name])
  //     const newWeight = Vector.lerp(faceData[i]?.score, currentWeight!, engineState?.deltaSeconds * 10)
  //     // avatarRig?.vrm?.expressionManager?.setValue(VRMExpressionPresetName[name], faceData[i]?.score)
  //     avatarRig?.vrm?.expressionManager?.setValue(VRMExpressionPresetName[name], newWeight)
  //     // console.log('map - cat: ', map)
  //     // const expMap = avatarRig?.vrm?.expressionManager?.expressions.filter((c) => (c?.expressionName.toLowerCase() === expName.toLowerCase()))
  //     // console.log('exp', expMap)
  //     // const exp = avatarRig?.vrm?.expressionManager?.expressions.filter((c) => (c?.expressionName.toLowerCase() === name.toLowerCase()))
  //     // console.log('exp', exp)
  //     // avatarRig?.vrm?.expressionManager?.setValue(name, faceData[i]?.score)
  //     // console.log('exp', avatarRig?.vrm?.expressionManager?.expressions.filter((c) => (c?.expressionName === `VRMExpression${faceData[i]?.categoryName}`)))
  //     // console.log(`map ${faceData[i]?.categoryName}`, avatarRig?.vrm?.expressionManager?.expressionMap[faceData[i]?.categoryName])
  //     // console.log('exp', avatarRig?.vrm?.expressionManager?.expressions?.map((c) => c?.expressionName))
  //     // debugger
  //   }
  //   avatarRig?.vrm?.expressionManager?.update()
  // //   // debugger
  // //   // const faceData = data?.face[0]?.categories
  // //   // for (let i = 0; i < faceData?.length - 1; i++) {
  // //   // avatarRig?.vrm?.expressionManager?.expressionMap
  // //   // []?.forEach((exp) => {
  // //   //   // console.log('exp', exp?.name, `VRMExpression_${faceData[i]?.categoryName}`)
  // //   //   if (exp?.name === `VRMExpression_${faceData[i]?.categoryName}`) {
  // //   //     console.log('exp match! ', exp?.name, `VRMExpression_${faceData[i]?.categoryName}`)
  // //   //     avatarRig?.vrm?.expressionManager?.setValue(faceData[i]?.categoryName, faceData[i]?.score)
  // //   //   }
  // //   // })
  // //   // }
  // }
}

export default UpdateRawFace
