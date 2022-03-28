import { Matrix4, Quaternion, Vector3 } from 'three'

import { Axis } from '../classes/Axis'
import { Chain } from '../classes/Chain'
import Pose, { BoneTransform } from '../classes/Pose'
import { CameraIKComponentType } from '../components/CameraIKComponent'
import { IKRigComponentType } from '../components/IKRigComponent'
import { cosSSS } from './IKFunctions'

///////////////////////////////////////////////////////////////////
// Multi Bone Solvers
///////////////////////////////////////////////////////////////////

export type IKSolverFunction = (
  chain: Chain,
  tpose: Pose,
  pose: Pose,
  axis: Axis,
  cLen: number,
  p_wt: BoneTransform
) => void

const vec3 = new Vector3()
const quat = new Quaternion()
const tempQuat1 = new Quaternion()
const tempQuat2 = new Quaternion()
const tempQuat3 = new Quaternion()
const tempVec1 = new Vector3()
const tempVec2 = new Vector3()
const tempVec3 = new Vector3()
const rot = new Quaternion()
const rot2 = new Quaternion()
const rotationMatrix = new Matrix4()

/**
 *
 * @param chain
 * @param tPose
 * @param pose
 * @param axis IKPose.target.axis
 * @param cLen IKPose.target.len
 * @param pwt parent world transform
 */
export function solveLimb(chain: Chain, tPose: Pose, pose: Pose, axis: Axis, cLen: number, pwt: BoneTransform) {
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Using law of cos SSS, we need the length of all sides of the triangle
  let bindA = tPose.bones[chain.chainBones[0].index], // Bone Reference from Bind
    bindB = tPose.bones[chain.chainBones[1].index],
    poseA = pose.bones[chain.chainBones[0].index], // Bone Reference from Pose
    poseB = pose.bones[chain.chainBones[1].index],
    aLen = bindA.length,
    bLen = bindB.length,
    rot = tempQuat1,
    rad: number

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // FIRST BONE - Aim then rotate by the angle.
  aimBone2(chain, tPose, axis, pwt, rot) // Aim the first bone toward the target oriented with the bend direction.

  const rotAfterAim = tempQuat2.copy(rot)
  const acbLen = { aLen, cLen, bLen }

  rad = cosSSS(aLen, cLen, bLen) // Get the Angle between First Bone and Target.

  const firstRad = rad

  rot
    .premultiply(tempQuat3.setFromAxisAngle(axis.x, -rad)) // Use the Target's X axis for rotation along with the angle from SSS
    .premultiply(tempQuat3.copy(pwt.quaternion).invert()) // Convert to Bone's Local Space by mul invert of parent bone rotation

  pose.setBone(bindA.index, rot) // Save result to bone.
  // Update World Data for future use

  poseA.world.position.copy(pwt.position)
  poseA.world.quaternion.copy(pwt.quaternion)
  poseA.world.scale.copy(pwt.scale)
  transformAdd(
    // transform
    poseA.world,
    // add
    {
      quaternion: rot,
      position: bindA.local.position,
      scale: bindA.local.scale
    }
  )

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // SECOND BONE
  // Need to rotate from Right to Left, So take the angle and subtract it from 180 to rotate from
  // the other direction. Ex. L->R 70 degrees == R->L 110 degrees
  rad = Math.PI - cosSSS(aLen, bLen, cLen)

  rot
    .copy(poseA.world.quaternion)
    .multiply(bindB.local.quaternion) // Add Bone 2's Local Bind Rotation to Bone 1's new World Rotation.
    .premultiply(tempQuat3.setFromAxisAngle(axis.x, rad)) // Rotate it by the target's x-axis
    .premultiply(tempQuat3.copy(poseA.world.quaternion).invert()) // Convert to Bone's Local Space

  pose.setBone(bindB.index, rot) // Save result to bone.

  // Update World Data for future use
  poseB.world.position.copy(poseA.world.position)
  poseB.world.quaternion.copy(poseA.world.quaternion)
  poseB.world.scale.copy(poseA.world.scale)
  transformAdd(
    // transform
    poseB.world,
    // add
    {
      quaternion: rot,
      position: bindB.local.position,
      scale: bindB.local.scale
    }
  )

  // TODO: Because of the quaternion object prop, it is better to
  // Accept an output object parameter instead of returning new object
  // and push the object construction up the chain
  return {
    rotAfterAim,
    acbLen,
    firstRad
  }
}

export function solveThreeBone(chain: Chain, tpose: Pose, pose: Pose, axis: Axis, cLen: number, pwt: BoneTransform) {
  //------------------------------------
  // Get the length of the bones, the calculate the ratio length for the bones based on the chain length
  // The 3 bones when placed in a zig-zag pattern creates a Parallelogram shape. We can break the shape down into two triangles
  // By using the ratio of the Target length divided between the 2 triangles, then using the first bone + half of the second bound
  // to solve for the top 2 joints, then uing the half of the second bone + 3rd bone to solve for the bottom joint.
  // If all bones are equal length,  then we only need to use half of the target length and only test one triangle and use that for
  // both triangles, but if bones are uneven, then we need to solve an angle for each triangle which this function does.

  //------------------------------------
  let bindBoneA = tpose.bones[chain.chainBones[0].index], // Bone Reference from Bind
    bindBoneB = tpose.bones[chain.chainBones[1].index],
    bindBoneC = tpose.bones[chain.chainBones[2].index],
    boneA = pose.bones[chain.chainBones[0].index], // Bone Reference from Pose
    boneB = pose.bones[chain.chainBones[1].index],
    boneC = pose.bones[chain.chainBones[2].index],
    aLen = bindBoneA.length, // First Bone length
    bLen = bindBoneB.length, // Second Bone Length
    c_len = bindBoneC.length, // Third Bone Length
    bhLen = bindBoneB.length * 0.5, // How Much of Bone 2 to use with Bone 1
    tRatio = (aLen + bhLen) / (aLen + bLen + c_len), // How much to subdivide the Target length between the two triangles
    taLen = cLen * tRatio, // Goes with A & B
    tbLen = cLen - taLen, // Goes with B & C
    rot = tempQuat1

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Bone A
  aimBone2(chain, tpose, axis, pwt, rot) // Aim the first bone toward the target oriented with the bend direction.

  let rad = cosSSS(aLen, taLen, bhLen) // Get the Angle between First Bone and Target.
  rot
    .premultiply(quat.setFromAxisAngle(axis.x, -rad)) // Rotate the the aimed bone by the angle from SSS
    .premultiply(quat.copy(pwt.quaternion).invert()) // Convert to Bone's Local Space by mul invert of parent bone rotation

  pose.setBone(bindBoneA.index, rot)

  boneA.world.position.copy(pwt.position)
  boneA.world.quaternion.copy(pwt.quaternion)
  boneA.world.scale.copy(pwt.scale)

  transformAdd(boneA.world, { ...bindBoneA.local, quaternion: rot })

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Bone B
  rad = Math.PI - cosSSS(aLen, bhLen, taLen)

  rot
    .copy(boneA.world.quaternion)
    .multiply(bindBoneB.local.quaternion) // Add Bone Local to get its WS rot
    .premultiply(quat.setFromAxisAngle(axis.x, rad)) // Rotate it by the target's x-axis .pmul( tmp.from_axis_angle( this.axis.x, rad ) )
    .premultiply(quat.copy(boneA.world.quaternion).invert()) // Convert to Local Space in temp to save WS rot for next bone.

  pose.setBone(bindBoneB.index, rot)

  boneB.world.position.copy(boneA.world.position)
  boneB.world.quaternion.copy(boneA.world.quaternion)
  boneB.world.scale.copy(boneA.world.scale)

  transformAdd(boneB.world, { ...bindBoneB.local, quaternion: rot })

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Bone C
  rad = Math.PI - cosSSS(c_len, bhLen, tbLen)
  rot
    .copy(boneB.world.quaternion)
    .multiply(bindBoneC.local.quaternion) // Still contains WS from previous bone, Add next bone's local
    .premultiply(quat.setFromAxisAngle(axis.x, -rad)) // Rotate it by the target's x-axis
    .premultiply(quat.copy(boneB.world.quaternion).invert()) // Convert to Bone's Local Space

  pose.setBone(bindBoneC.index, rot)

  boneC.world.position.copy(boneB.world.position)
  boneC.world.quaternion.copy(boneB.world.quaternion)
  boneC.world.scale.copy(boneB.world.scale)

  transformAdd(boneC.world, { ...bindBoneC.local, quaternion: rot })
}

/**
 * Computing Transforms, Parent -> Child
 * @param target target transform (will be modified)
 * @param source source transform
 */
export function transformAdd(target: BoneTransform, source: BoneTransform) {
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // POSITION - parent.position + ( parent.rotation * ( parent.scale * child.position ) )
  // pos.add( Vec3.mul( this.scl, cp ).transform_quat( this.rot ) );
  target.position.add(vec3.copy(source.position).multiply(target.scale).applyQuaternion(target.quaternion))

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // SCALE - parent.scale * child.scale
  if (source.scale) target.scale.multiply(source.scale)

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // ROTATION - parent.rotation * child.rotation
  target.quaternion.multiply(source.quaternion)
}

//// helpers

function aimBone2(chain: Chain, tpose: Pose, axis: Axis, pwt: BoneTransform, out: Quaternion) {
  const bone = tpose.bones[chain.first()].bone
  rotationMatrix.extractRotation(bone.matrixWorld)

  const dir = vec3.copy(chain.altForward).applyQuaternion(rot.setFromRotationMatrix(rotationMatrix)) // Get Bone's WS Forward Dir

  //Swing
  rot2.setFromUnitVectors(dir, axis.z)
  out.copy(rot2).multiply(rot)

  // Twist
  // let u_dir = chain.altUp.clone().applyQuaternion(out)
  // let twistx = u_dir.angleTo(axis.y)
  //App.Debug.ln( ct.pos, Vec3.add( ct.pos, u_dir), "white" );

  dir.copy(chain.altUp).applyQuaternion(out) // After Swing, Whats the UP Direction
  let twist = dir.angleTo(axis.y) // Get difference between Swing Up and Target Up

  if (twist <= 0.00017453292) twist = 0
  else {
    //let l_dir  	= Vec3.cross( dir, this.axis.z );
    dir.crossVectors(dir, axis.z) // Get Swing LEFT, used to test if twist is on the negative side.
    //App.Debug.ln( ct.pos, Vec3.add( ct.pos, l_dir), "black" );

    if (dir.dot(axis.y) >= 0) twist = -twist
  }

  out.premultiply(rot.setFromAxisAngle(axis.z, twist)) // Apply Twist
}

function getFwdVector(matrix: Matrix4, outVec: Vector3) {
  const e = matrix.elements
  outVec.set(e[8], e[9], e[10]).normalize()
}

export function applyCameraLook(rig: IKRigComponentType, solver: CameraIKComponentType) {
  const bone = rig.pose!.skeleton.bones[solver.boneIndex]

  if (!bone) {
    return
  }

  bone.matrixWorld.decompose(tempVec1, tempQuat1, tempVec2)
  const toLocal = tempQuat1.invert()

  const boneFwd = tempVec1
  const targetDir = tempVec2

  getFwdVector(bone.matrix, boneFwd)

  getFwdVector(solver.camera.matrixWorld, targetDir)
  targetDir.multiplyScalar(-1).applyQuaternion(toLocal).normalize()

  const angle = Math.acos(boneFwd.dot(targetDir))

  if (solver.rotationClamp > 0 && angle > solver.rotationClamp) {
    const deltaTarget = tempVec3.copy(targetDir).sub(boneFwd)
    // clamp delta target to within the ratio
    deltaTarget.multiplyScalar(solver.rotationClamp / angle)
    // set new target
    targetDir.copy(boneFwd).add(deltaTarget).normalize()
  }

  tempQuat1.setFromUnitVectors(boneFwd, targetDir)
  bone.quaternion.premultiply(tempQuat1)
}
