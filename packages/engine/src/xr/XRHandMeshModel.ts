import { Group, Object3D, SkinnedMesh } from 'three'

import { proxifyQuaternion, proxifyVector3 } from './../common/proxies/createThreejsProxy'
import { Entity } from './../ecs/classes/Entity'
import { XRHandsInputComponent } from './XRComponents'
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

    let joints = []
    XRHandBones.forEach((bone) => {
      joints = joints.concat(bone as any)
    })

    joints.forEach((jointName) => {
      const bone = model.getObjectByName(jointName)

      if (bone) {
        ;(bone as any).jointName = jointName

        proxifyVector3(XRHandsInputComponent[handedness][jointName].position, entity, bone.position)
        proxifyQuaternion(XRHandsInputComponent[handedness][jointName].quaternion, entity, bone.quaternion)

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
