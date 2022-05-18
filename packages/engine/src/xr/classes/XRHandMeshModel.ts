import { Group, Object3D, SkinnedMesh } from 'three'
import { proxifyQuaternion, proxifyVector3 } from '../../common/proxies/three'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { XRHandsInputComponent } from '../components/XRHandsInputComponent'

export class XRHandMeshModel extends Object3D {
  controller: Group
  bones: any[]

  constructor(controller: Group, model: Object3D, handedness: string) {
    super()

    const world = useWorld()

    this.controller = controller
    this.bones = []
    this.add(model)

    const mesh = model.getObjectByProperty('type', 'SkinnedMesh') as SkinnedMesh
    mesh.frustumCulled = false
    mesh.castShadow = true
    mesh.receiveShadow = true

    const joints = [
      'wrist',
      'thumb-metacarpal',
      'thumb-phalanx-proximal',
      'thumb-phalanx-distal',
      'thumb-tip',
      'index-finger-metacarpal',
      'index-finger-phalanx-proximal',
      'index-finger-phalanx-intermediate',
      'index-finger-phalanx-distal',
      'index-finger-tip',
      'middle-finger-metacarpal',
      'middle-finger-phalanx-proximal',
      'middle-finger-phalanx-intermediate',
      'middle-finger-phalanx-distal',
      'middle-finger-tip',
      'ring-finger-metacarpal',
      'ring-finger-phalanx-proximal',
      'ring-finger-phalanx-intermediate',
      'ring-finger-phalanx-distal',
      'ring-finger-tip',
      'pinky-finger-metacarpal',
      'pinky-finger-phalanx-proximal',
      'pinky-finger-phalanx-intermediate',
      'pinky-finger-phalanx-distal',
      'pinky-finger-tip'
    ]

    joints.forEach((jointName) => {
      const bone = model.getObjectByName(jointName)

      if (bone) {
        ;(bone as any).jointName = jointName

        proxifyVector3(XRHandsInputComponent[handedness][jointName].position, world.localClientEntity, bone.position)
        proxifyQuaternion(
          XRHandsInputComponent[handedness][jointName].quaternion,
          world.localClientEntity,
          bone.quaternion
        )

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
