import { Chain } from '../components/Chain'
import Pose from '../classes/Pose'
import { Quaternion, Vector3 } from 'three'
import { Axis } from '../classes/Axis'
import { lawCosinesSSS } from './IKFunctions'

///////////////////////////////////////////////////////////////////
// Multi Bone Solvers
///////////////////////////////////////////////////////////////////
/**
 *
 * @param chain
 * @param tpose
 * @param pose
 * @param axis IKPose.target.axis
 * @param cLen IKPose.target.len
 * @param p_wt parent world transform
 */
export function solveLimb(chain: Chain, tpose: Pose, pose: Pose, axis: Axis, cLen: number, p_wt) {
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Using law of cos SSS, so need the length of all sides of the triangle
  let bind_a = tpose.bones[chain.chainBones[0].index], // Bone Reference from Bind
    bind_b = tpose.bones[chain.chainBones[1].index],
    pose_a = pose.bones[chain.chainBones[0].index], // Bone Reference from Pose
    pose_b = pose.bones[chain.chainBones[1].index],
    aLen = bind_a.length,
    bLen = bind_b.length,
    // cLen = this.len,
    rot = new Quaternion(),
    rad: number

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // FIRST BONE - Aim then rotate by the angle.
  _aim_bone2(chain, tpose, axis, p_wt, rot) // Aim the first bone toward the target oriented with the bend direction.

  const rotAfterAim = rot.clone()
  const acbLen = { aLen, cLen, bLen }

  rad = lawCosinesSSS(aLen, cLen, bLen) // Get the Angle between First Bone and Target.

  const firstRad = rad

  // ORIGINAL CODE
  // rot
  //   .pmul_axis_angle(this.axis.x, -rad)
  //   .pmul_invert(p_wt.rot)
  rot
    .premultiply(new Quaternion().setFromAxisAngle(axis.x, -rad)) // Use the Target's X axis for rotation along with the angle from SSS
    .premultiply(p_wt.quaternion.clone().invert()) // Convert to Bone's Local Space by mul invert of parent bone rotation

  debugger

  // TODO: uncomment
  pose.setBone(bind_a.idx, rot) // Save result to bone.
  // Update World Data for future use
  /* ORIGINAL
  			pose_a.world											// Update World Data for future use
				.copy( p_wt )
				.add( rot, bind_a.local.pos, bind_a.local.scl );
   */
  pose_a.world.position.copy(p_wt.position)
  pose_a.world.quaternion.copy(p_wt.quaternion)
  pose_a.world.scale.copy(p_wt.scale)
  transformAdd(
    // transform
    pose_a.world.quaternion,
    pose_a.world.position,
    pose_a.world.scale,
    // add
    rot,
    bind_a.local.position,
    bind_a.local.scale
  )

  //   .copy(p_wt)
  //   .add(rot, bind_a.local.pos, bind_a.local.scl)

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // SECOND BONE
  // Need to rotate from Right to Left, So take the angle and subtract it from 180 to rotate from
  // the other direction. Ex. L->R 70 degrees == R->L 110 degrees
  rad = Math.PI - lawCosinesSSS(aLen, bLen, cLen)

  rot
    .copy(pose_a.world.quaternion)
    .multiply(bind_b.local.quaternion) // Add Bone 2's Local Bind Rotation to Bone 1's new World Rotation.
    .premultiply(new Quaternion().setFromAxisAngle(axis.x, rad)) // Rotate it by the target's x-axis
    .premultiply(pose_a.world.quaternion.clone().invert()) // Convert to Bone's Local Space

  pose.setBone(bind_b.idx, rot) // Save result to bone.

  // Update World Data for future use
  //  ORIGINAL
  //   pose_b.world
  //     .copy(pose_a.world)
  pose_b.world.position.copy(pose_a.world.position)
  pose_b.world.quaternion.copy(pose_a.world.quaternion)
  pose_b.world.scale.copy(pose_a.world.scale)
  // pose_b.world.add(rot, bind_b.local.pos, bind_b.local.scl)
  transformAdd(
    // transform
    pose_b.world.quaternion,
    pose_b.world.position,
    pose_b.world.scale,
    // add
    rot,
    bind_b.local.position,
    bind_b.local.scale
  )

  return {
    rotAfterAim,
    acbLen,
    firstRad
  }
}

// Computing Transforms, Parent -> Child
/**
 *
 * @param pr parent quaternion (will be modified)
 * @param pp parent position (will be modified)
 * @param ps parent scale (will be modified)
 * @param cr child quaternion
 * @param cp child position
 * @param cs child scale
 */
export function transformAdd(
  pr: Quaternion,
  pp: Vector3,
  ps: Vector3,
  cr: Quaternion,
  cp: Vector3,
  cs: Vector3 | null = null
) {
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // POSITION - parent.position + ( parent.rotation * ( parent.scale * child.position ) )
  // pos.add( Vec3.mul( this.scl, cp ).transform_quat( this.rot ) );
  pp.add(cp.clone().multiply(ps).applyQuaternion(pr))

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // SCALE - parent.scale * child.scale
  if (cs) ps.multiply(cs)

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // ROTATION - parent.rotation * child.rotation
  pr.multiply(cr)
}

//// helpers

function _aim_bone2(chain: Chain, tpose: Pose, axis: Axis, p_wt, out: Quaternion) {
  const rot = new Quaternion()
  tpose.bones[chain.first()].bone.getWorldQuaternion(rot) // Get World Space Rotation for Bone
  const dir = chain.altForward.clone().applyQuaternion(rot) // Get Bone's WS Forward Dir

  //Swing
  let q = new Quaternion().setFromUnitVectors(dir, axis.z)
  out.copy(q).multiply(rot)

  // Twist
  let u_dir = chain.altUp.clone().applyQuaternion(out)
  let twistx = u_dir.angleTo(axis.y)
  debugger
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

  out.premultiply(new Quaternion().setFromAxisAngle(axis.z, twist)) // Apply Twist
  debugger
}
