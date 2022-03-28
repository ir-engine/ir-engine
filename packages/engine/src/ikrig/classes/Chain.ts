import { Bone, Vector3 } from 'three'

import { FORWARD, UP } from '../constants/Vector3Constants'
import { IKSolverFunction } from '../functions/IKSolvers'
import Pose, { PoseBoneLocalState } from './Pose'

type ChainBoneData = { index: number; ref: Bone; length: number }

const boneWorldPosition = new Vector3(),
  childWorldPosition = new Vector3()

export class Chain {
  endIndex: number
  chainBones: ChainBoneData[]
  length: number
  count: number
  altForward: Vector3
  altUp: Vector3
  ikSolver: IKSolverFunction

  constructor() {
    this.chainBones = [] // Index to a bone in an armature / pose
    this.length = 0 // Chain Length
    this.count = 0 // How many Bones in the chain

    //this.align_axis	= axis;			// Chain is aligned to which axis
    this.endIndex = -1 // Joint that Marks the true end of the chain

    this.altForward = FORWARD.clone()
    this.altUp = UP.clone()
  }

  // Get Skeleton Index of Bones
  first() {
    return this.chainBones[0].index
  }
  last() {
    return this.chainBones[this.count - 1].index
  }
  index(i) {
    return this.chainBones[i].index
  }

  setOffsets(forward: Vector3, up: Vector3, tpose: Pose): Chain {
    // ORIGINAL CODE
    // 	let b = tpose.bones[ this.bones[ 0 ].idx ],
    // 	q = Quat.invert( b.world.rot );	// Invert World Space Rotation

    // this.alt_fwd.from_quat( q, fwd );	// Use invert to get direction that will Recreate the real direction
    // this.alt_up.from_quat( q, up );
    const b = tpose.bones[this.chainBones[0].index]

    const q = b.world.quaternion.clone().invert() // Invert World Space Rotation
    this.altForward.copy(forward).applyQuaternion(q).normalize() // Use invert to get direction that will Recreate the real direction
    this.altUp.copy(up).applyQuaternion(q).normalize()

    return this
  }

  // Recompute the Length of the bones for each chain. Most often this
  // is a result of scale being applied to the armature object that can
  // only be computed after the rig is setup
  computeLengthFromBones(bones: PoseBoneLocalState[]) {
    const end = this.count - 1
    let sum = 0

    // Loop Every Bone Except Last one
    for (let i = 0; i < end; i++) {
      const bone = bones[this.chainBones[i].index]

      boneWorldPosition.copy(bones[this.chainBones[i].index].world.position)
      childWorldPosition.copy(bones[this.chainBones[i + 1].index].world.position)
      //this.chainBones[i + 1].ref.getWorldPosition(childWorldPosition)

      bone.length = boneWorldPosition.distanceTo(childWorldPosition)
      this.chainBones[i].length = bone.length

      sum += bone.length
    }

    // If End Point exists, Can calculate the final bone's length
    if (this.endIndex > -1) {
      const bd = this.chainBones[end]
      bd.length = bones[this.endIndex].world.position.distanceTo(bones[this.chainBones[end].index].world.position)
      bones[this.chainBones[end].index].length = bd.length
      sum += bd.length
    } else console.warn('Recompute Chain Len, End Index is missing')

    this.length = sum
    return this
  }
}
