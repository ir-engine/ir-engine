// @ts-nocheck
import { Bone, SkinnedMesh } from 'three'
import { Object3D, Quaternion, Skeleton, Vector3 } from 'three'
import { SkeletonUtils } from '../../avatar/SkeletonUtils'
import { DOWN, LEFT, RIGHT } from '../constants/Vector3Constants'
import { spinBoneForward, alignChain, alignBoneForward, worldToModel } from '../functions/IKFunctions'
import { Entity } from '../../ecs/classes/Entity'
import { transformAdd } from '../functions/IKSolvers'

export type PoseBoneTransform = {
  position: Vector3
  quaternion: Quaternion
  scale: Vector3
}

export type PoseBoneLocalState = {
  bone: Bone
  parent: Bone | null
  chg_state: number // If Local Has Been Updated
  idx: number // Bone Index in Armature
  p_idx: number | null // Parent Bone Index in Armature
  length: number // Length of Bone
  name: string
  local: PoseBoneTransform // Local Transform, use Bind pose as default
  world: PoseBoneTransform // Model Space Transform
}

class Pose {
  static ROTATION = 1
  static POSITION = 2
  static SCALE = 4

  entity: Entity
  skeleton: Skeleton
  bones: PoseBoneLocalState[]
  rootOffset = {
    quaternion: new Quaternion(),
    position: new Vector3(0, 0, 0),
    scale: new Vector3(1, 1, 1)
  }
  helper: any

  align_leg(b_names: string[]) {
    alignChain(this, DOWN, b_names)
    return this
  }
  align_arm_left(b_names: string[]) {
    alignChain(this, LEFT, b_names)
    return this
  }
  align_arm_right(b_names: string[]) {
    alignChain(this, RIGHT, b_names)
    return this
  }

  align_foot(b_name: string) {
    spinBoneForward(this, b_name)
    alignBoneForward(this, b_name)
    return this
  }

  spin_bone_forward(b_name: string) {
    spinBoneForward(this, b_name)
    return this
  }
  align_bone_forward(b_name: string) {
    alignBoneForward(this, b_name)
    return this
  }

  /**
   *
   * @param rootObject object containing skinnedMesh and it's bones
   * @param clone make a cloned version of skeleton
   */
  constructor(rootObject: Object3D, clone = false) {
    this.bones = []
    const parent: Object3D = clone ? SkeletonUtils.clone(rootObject) : rootObject
    this.skeleton = this.get_skeleton(parent) // Recreation of Bone Hierarchy

    if (!this.skeleton.bones[0]) {
      debugger
    }

    // this.bones = this.skeleton.bones
    this.rootOffset = new Object3D() // Parent Transform for Root Bone ( Skeletons from FBX imports need this to render right )

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Create Bone Transform Hierarchy to do transformations
    // without changing the actual armature.
    const skeletonTransform = {
      position: new Vector3(),
      quaternion: new Quaternion(),
      invQuaternion: new Quaternion(),
      scale: new Vector3()
    }

    const rootBone = this.skeleton.bones.find((b) => !(b.parent instanceof Bone))
    if (rootBone.parent) {
      rootBone.parent.getWorldPosition(skeletonTransform.position)
      rootBone.parent.getWorldQuaternion(skeletonTransform.quaternion)
      rootBone.parent.getWorldScale(skeletonTransform.scale)
      skeletonTransform.invQuaternion.copy(skeletonTransform.quaternion).invert()
    }

    for (let i = 0; i < this.skeleton.bones.length; i++) {
      const b = this.skeleton.bones[i]
      let p_idx, boneParent
      if (b.parent && b.parent instanceof Bone) {
        p_idx = this.skeleton.bones.indexOf(b.parent)
        boneParent = b.parent
      }

      const boneData = {
        bone: b,
        parent: boneParent,
        chg_state: 0, // If Local Has Been Updated
        idx: i, // Bone Index in Armature
        p_idx: p_idx, // Parent Bone Index in Armature
        length: 0.1, // Length of Bone
        name: b.name,
        local: {
          position: b.position.clone(),
          quaternion: b.quaternion.clone(),
          scale: b.scale.clone()
        }, // Local Transform, use Bind pose as default
        world: {
          position: new Vector3(),
          quaternion: new Quaternion(),
          invQuaternion: new Quaternion(),
          scale: new Vector3()
        } // Model Space Transform
      }

      b.getWorldPosition(boneData.world.position)
      b.getWorldQuaternion(boneData.world.quaternion)
      b.getWorldScale(boneData.world.scale)

      // convert to model space
      worldToModel(boneData.world.position, boneData.world.quaternion, boneData.world.scale, skeletonTransform)
      // Calculate this once for tpose
      boneData.world.invQuaternion.copy(boneData.world.quaternion).invert()

      //b['index'] = i
      if (b.children.length > 0) {
        // b.getWorldPosition(bWorldPosition)
        // b.children[0].getWorldPosition(bChildWorldPosition)
        // bWorldPosition.divide(skeletonTransform.scale)
        // bChildWorldPosition.divide(skeletonTransform.scale)

        boneData.length = b.children[0].position.length()
      }

      this.bones[i] = boneData
    }

    this.skeleton.update()
  }

  get_skeleton(rootObject: Object3D): Skeleton | null {
    let skeleton: Skeleton = null

    rootObject.traverse((object) => {
      if (object instanceof SkinnedMesh && object.skeleton != null) {
        if (skeleton && skeleton.bones.length > object.skeleton.bones.length) {
          return
        }
        skeleton = object.skeleton
      }
    })

    return skeleton
  }

  setOffset(quaternion: Quaternion, position: Vector3, scale: Vector3) {
    this.rootOffset.quaternion.copy(quaternion)
    this.rootOffset.position.copy(position)
    this.rootOffset.scale.copy(scale)
    return this
  }

  setBone(index: number, quaternion?: Quaternion, position?: Vector3, scale?: Vector3) {
    // TODO: check this out, they store this in separate structure that does not change original bone data
    if (quaternion) this.bones[index].local.quaternion.copy(quaternion)
    if (position) this.bones[index].local.position.copy(position)
    if (scale) this.bones[index].local.scale.copy(scale)
    return this
  }

  getBone(name: string): PoseBoneLocalState {
    // TODO: replace with Map?
    return this.bones.find((b) => b.name === name)
  }

  apply(): Pose {
    // Copies modified LquatInverseocal Transforms of the Pose to the Bone Entities.
    // const targetSkeleton: Skeleton = getComponent(this.entity, IKObj).ref.skeleton

    let pb: PoseBoneLocalState, // Pose Bone
      o: Bone // Bone Object
    for (let i = 0; i < this.skeleton.bones.length; i++) {
      pb = this.bones[i]

      // Check if bone has been modified in the pose
      o = this.skeleton.bones[i]
      // Copy changes to Bone Entity
      // o.setRotationFromQuaternion(pb.quaternion)

      o.quaternion.copy(pb.local.quaternion)
      o.position.copy(pb.local.position)
      o.scale.copy(pb.local.scale)
    }
    this.skeleton.update()
    // targetSkeleton.update()
    return this
  }

  // If these are temp vars okay, but these might need to move to the bones?? Do we need these if we have world poses on bones?
  parentQuaternion = new Quaternion()
  parentScale = new Vector3(1, 1, 1)
  parentPosition = new Vector3(0, 0, 0)

  childQuaternion = new Quaternion()
  childScale = new Vector3(1, 1, 1)
  childPosition = new Vector3(0, 0, 0)

  // Make sure this is properly named
  setChildFromParent(parent: Object3D, child: Object3D): Pose {
    console.log('parent, child', parent, child)

    // POSITION - parent.position + ( parent.quaternion * ( parent.scale * child.position ) )
    // TODO: Make sure this matrix isn't flipped
    const v: Vector3 = new Vector3()
      .copy(parent.scale)
      .multiply(child.position) // parent.scale * child.position;
      .applyQuaternion(parent.quaternion) //Vec3.transformQuat( v, tp.quaternion, v );
    this.childPosition = new Vector3().copy(parent.position).add(v) // Vec3.add( tp.position, v, this.position );

    console.log('v is', v)
    console.log('this.childPosition', this.childPosition)

    // SCALE - parent.scale * child.scale
    // TODO: not flipped, right?
    this.childScale = new Vector3().copy(parent.scale).multiply(child.scale)

    // ROTATION - parent.quaternion * child.quaternion
    this.childQuaternion = new Quaternion().copy(parent.quaternion).multiply(child.quaternion)

    return this
  }

  getParentRotation(boneIndex: number): Quaternion {
    // // ORIGINAL CODE
    // // get_parent_rot( b_idx, q=null ){
    // // 	let cbone = this.bones[ b_idx ];
    // // 	q = q || new Quat();
    //
    // const bone = this.skeleton.bones[this.bones[boneIndex].idx]
    // const q = new Quaternion()
    //
    // // ORIGINAL CODE
    // //if( cbone.p_idx == null ) q.reset();
    // // Child is a Root Bone, just reset since there is no parent.
    // if (bone.parent == null) q.identity()
    // else {
    //   // ORIGINAL CODE
    //   // let b = this.bones[ cbone.p_idx ];
    //   // 	q.copy( b.local.rot );
    //
    //   // 	while( b.p_idx != null ){
    //   // 		b = this.bones[ b.p_idx ];
    //   // 		q.pmul( b.local.rot );
    //   // 	}
    //   // Parents Exist, loop till reaching the root
    //   let b = bone.parent
    //   q.copy(b.quaternion)
    //   while (b.parent != null && b.parent.type === 'Bone') {
    //     b = b.parent
    //     q.premultiply(b.quaternion)
    //   }
    // }
    // // ORIGINAL CODE
    // // q.pmul( this.root_offset.rot ); // Add Starting Offset
    // q.premultiply(this.rootOffset.quaternion) // Add Starting Offset
    const cbone = this.bones[boneIndex]
    const q = new Quaternion()

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Child is a Root Bone, just reset since there is no parent.
    if (cbone.p_idx == null) q.identity()
    else {
      // Parents Exist, loop till reaching the root
      let b = this.bones[cbone.p_idx]
      q.copy(b.local.quaternion)

      while (b.p_idx != null) {
        b = this.bones[b.p_idx]
        q.premultiply(b.local.quaternion)
      }
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    q.premultiply(this.rootOffset.quaternion) // Add Starting Offset
    return q
  }

  transformAdd_rev(pt: PoseBoneTransform, ct: PoseBoneTransform) {
    pt.position.multiply(ct.scale).applyQuaternion(ct.quaternion).add(ct.position)
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // SCALE - parent.scale * child.scale
    pt.scale.multiply(ct.scale)
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // ROTATION - parent.rotation * child.rotation
    pt.quaternion.premultiply(ct.quaternion) // Must Rotate from Parent->Child, need PMUL
  }

  get_parent_world(
    b_idx: number,
    pt: PoseBoneTransform = null,
    ct: PoseBoneTransform = null,
    t_offset: PoseBoneTransform = null
  ) {
    const cbone = this.bones[b_idx]

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    // Child is a Root Bone, just reset since there is no parent.
    if (cbone.p_idx == null) {
      pt.position.set(0, 0, 0)
      pt.scale.set(0, 0, 0)
      pt.quaternion.set(0, 0, 0, 0)
    } else {
      // Parents Exist, loop till reaching the root
      let b = this.bones[cbone.p_idx]
      pt.position.copy(b.local.position)
      pt.scale.copy(b.local.scale)
      pt.quaternion.copy(b.local.quaternion)

      while (b.p_idx != null) {
        b = this.bones[b.p_idx]
        this.transformAdd_rev(pt, b.local)
      }
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    this.transformAdd_rev(pt, this.rootOffset) // Add Starting Offset
    if (t_offset) {
      this.transformAdd_rev(pt, t_offset) // Add Additional Starting Offset
    }

    if (ct) {
      ct.position.copy(pt.position)
      ct.scale.copy(pt.scale)
      ct.quaternion.copy(pt.quaternion)
      transformAdd(ct, cbone.local) // Requesting Child WS Info Too
      // ct.from_add(pt, cbone.local) // Requesting Child WS Info Too
    }

    return pt
  }
}

export default Pose
