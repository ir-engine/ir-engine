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

import { Group, Object3D, SkinnedMesh } from 'three'

import { Entity } from './../ecs/classes/Entity'
import { XRHandBones } from './XRHandBones'

export class XRHandMeshModel extends Object3D {
  controller: Group
  bones: any[]
  handedness: string

  constructor(entity: Entity, controller: Group, model: Object3D, handedness: string) {
    super()

    this.controller = controller
    this.bones = []
    this.handedness = handedness
    this.add(model)

    const mesh = model.getObjectByProperty('type', 'SkinnedMesh') as SkinnedMesh
    mesh.frustumCulled = false
    mesh.castShadow = true
    mesh.receiveShadow = true

    XRHandBones.forEach((jointName) => {
      const bone = model.getObjectByName(jointName)

      if (bone) {
        ;(bone as any).jointName = jointName

        // proxifyVector3(XRHandsInputComponent[handedness][jointName].position, entity, bone.position)
        // proxifyQuaternion(XRHandsInputComponent[handedness][jointName].quaternion, entity, bone.quaternion)

        this.bones.push(bone)
      } else {
        console.warn(`Couldn't find ${jointName} in ${handedness} hand mesh`)
      }
    })
  }

  updateMesh() {
    // TODO: Handle motion detection issues (e.g fade out hands if no updates coming in)

    // XR Joints
    const XRJoints = (this.controller as any).joints

    if (!XRJoints) return

    for (let i = 0; i < this.bones.length; i++) {
      const bone = this.bones[i]

      if (bone) {
        const XRJoint = XRJoints[bone.jointName] as Group

        if (XRJoint?.visible) {
          if (bone) {
            bone.position.copy(XRJoint.position)
            bone.quaternion.copy(XRJoint.quaternion)
          }
        }
      }
    }
  }

  updateMatrixWorld(force?: boolean) {
    super.updateMatrixWorld(force)
    this.updateMesh()
  }
}
