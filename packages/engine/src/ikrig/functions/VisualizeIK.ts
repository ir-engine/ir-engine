import { Vector3 } from 'three'
import { IKRigComponentType } from '../components/IKRigComponent'

const boneAWorldPos = new Vector3()

// How to visualize the IK Pose Informaation to get an Idea of what we're looking at.
export function visualizeHip(rig: IKRigComponentType, ik) {
  rig.pose.bones[rig.points.hip.index].bone.getWorldPosition(boneAWorldPos)
  // Debug.setPoint(boneAWorldPos, COLOR.orange, 6, 6).setLine(
  //   boneAWorldPos,
  //   new Vector3().copy(ik.hip.dir).multiplyScalar(0.2).add(boneAWorldPos),
  //   COLOR.cyan,
  //   null,
  //   true
  // )
}

export function visualizeLimb(pose, chain, ik) {
  const poseBone = pose.bones[chain.first()].bone
  poseBone.getWorldPosition(boneAWorldPos)
  const len = chain.length * ik.lengthScale,
    posA = boneAWorldPos,
    posB = new Vector3().copy(ik.dir).multiplyScalar(len).add(posA),
    posC = new Vector3().copy(ik.jointDirection).multiplyScalar(0.2).add(posA) // Direction of Joint

  // Debug.setPoint(posA, COLOR.yellow, 6, 4)
  //   .setPoint(posB, COLOR.orange, 6, 4)
  //   .setLine(posA, posB, COLOR.yellow, COLOR.orange, true)
  //   .setLine(posA, posC, COLOR.yellow, null, true)
}

export function visualizeLookTwist(rig, boneInfo, ik) {
  const position = new Vector3()
  rig.pose.bones[boneInfo.index].getWorldPosition(position)
  // Debug.setPoint(position, COLOR.cyan, 1, 2.5) // Foot Position
  //   .setLine(position, new Vector3().copy(ik.lookDirection).multiplyScalar(0.2).add(position), COLOR.cyan, null, true) // IK.DIR
  //   .setLine(position, new Vector3().copy(ik.twistDirection).multiplyScalar(0.2).add(position), COLOR.cyan, null, true) // RESULT OF IK.TWIST
}

export function visualizeSpine(rig: IKRigComponentType, chain, ik_ary) {
  const ws = new Vector3(0, 0, 0),
    index = [chain.first(), chain.last()]
  let ik

  for (let i = 0; i < 2; i++) {
    const poseBone = rig.pose.bones[index[i]].bone

    poseBone.getWorldPosition(ws)
    ik = ik_ary[i]

    // Debug.setPoint(ws, COLOR.orange, 1, 2)
    //   .setLine(ws, new Vector3().copy(ik.lookDirection).multiplyScalar(0.2).add(ws), COLOR.yellow, null)
    //   .setLine(ws, new Vector3().copy(ik.twistDirection).multiplyScalar(0.2).add(ws), COLOR.orange, null)
  }
}
