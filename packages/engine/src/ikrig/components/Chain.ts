import { Quaternion, Vector3 } from 'three'
import { FORWARD, UP } from '../constants/Vector3Constants'

const boneWorldPosition = new Vector3(),
  childWorldPosition = new Vector3()
export class Chain {
  end_idx: any
  chainBones: any[]
  length: number
  cnt: number
  altForward: any
  altUp: any
  constructor() {
    this.chainBones = [] // Index to a bone in an armature / pose
    this.length = 0 // Chain Length
    this.cnt = 0 // How many Bones in the chain

    //this.align_axis	= axis;			// Chain is aligned to which axis
    this.end_idx = null // Joint that Marks the true end of the chain

    this.altForward = FORWARD.clone()
    this.altUp = UP.clone()
  }

  // Get Skeleton Index of Bones
  first() {
    return this.chainBones[0].index
  }
  last() {
    return this.chainBones[this.cnt - 1].index
  }
  index(i) {
    return this.chainBones[i].index
  }

  setOffsets(fwd, up, tpose) {
    // ORIGINAL CODE
    // 	let b = tpose.bones[ this.bones[ 0 ].idx ],
    // 	q = Quat.invert( b.world.rot );	// Invert World Space Rotation

    // this.alt_fwd.from_quat( q, fwd );	// Use invert to get direction that will Recreate the real direction
    // this.alt_up.from_quat( q, up );
    const b = tpose.bones[this.chainBones[0].index]

    const boneWorldQuaternion = new Quaternion()
    b.getWorldQuaternion(boneWorldQuaternion)
    boneWorldQuaternion.invert() // Invert World Space Rotation
    this.altForward = new Vector3().copy(fwd).applyQuaternion(boneWorldQuaternion).normalize() // Use invert to get direction that will Recreate the real direction
    this.altUp = new Vector3().copy(up).applyQuaternion(boneWorldQuaternion).normalize()

    return this
  }

  computeLengthFromBones(bones) {
    const end = this.cnt - 1
    let sum = 0,
      b,
      i

    // Loop Every Bone Except Last one
    for (i = 0; i < end; i++) {
      b = bones[i]

      this.chainBones[i].ref.getWorldPosition(boneWorldPosition)
      this.chainBones[i + 1].ref.getWorldPosition(childWorldPosition)

      b.length = boneWorldPosition.distanceTo(childWorldPosition)

      sum += b.length
    }

    // If End Point exists, Can calculate the final bone's length
    if (this.end_idx != null) {
      bones[this.end_idx].getWorldPosition(boneWorldPosition)
      this.chainBones[i].ref.getWorldPosition(childWorldPosition)
      b.length = boneWorldPosition.distanceTo(childWorldPosition)
      sum += b.length
    } else console.warn('Recompute Chain Len, End Index is missing')

    this.length = sum
    return this
  }
}
