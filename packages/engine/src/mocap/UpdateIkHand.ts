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

export const motionCaptureHeadSuffix = '_motion_capture_head'
export const motionCaptureLeftHandSuffix = '_motion_capture_left_hand'
export const motionCaptureRightHandSuffix = '_motion_capture_right_hand'

const UpdateIkHands = (data, handedness, hipsPos, avatarRig, avatarTransform) => {
  return null
  /*if (data) {
    const engineState = getState(EngineState)

    const leftHand = avatarRig?.vrm?.humanoid?.getRawBone('leftHand')?.node
    const rightHand = avatarRig?.vrm?.humanoid?.getRawBone('rightHand')?.node

    for (let i = 0; i < data.length - 1; i++) {
      // fingers start at 25
      const name = VRMHumanBoneList[i + 25].toLowerCase()
      const hand = data[i]

      const lhPos = new Vector3()
      leftHand?.getWorldPosition(lhPos)
      const rhPos = new Vector3()
      rightHand?.getWorldPosition(rhPos)

      const targetPos = new Vector3()
      targetPos
        .set(hand?.x, hand?.y, hand?.z)
        .multiplyScalar(-1)
        .applyQuaternion(avatarTransform.rotation)
        .add(hipsPos.clone())
      // .add(name.startsWith('left') ? lhPos : rhPos)

      const allowedTargets = ['']

      const entityUUID = `${Engine?.instance?.userId}_mocap_${name}` as EntityUUID
      const ikTarget = UUIDComponent.entitiesByUUID[entityUUID]
      // if (ikTarget) removeEntity(ikTarget)

      if (!ikTarget) {
        dispatchAction(XRAction.spawnIKTarget({ entityUUID: entityUUID, name }))
      }

      const ik = getComponent(ikTarget, TransformComponent)
      // ik.position.lerp(targetPos, engineState.deltaSeconds * 10)

      // ik.quaternion.copy()
    }
  }
  */
}

export default UpdateIkHands
