import { Bone, SkinnedMesh } from 'three'
import { Object3D, Quaternion, Skeleton, Vector3 } from 'three'
import { SkeletonUtils } from '../../avatar/SkeletonUtils'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { IKObj } from '../components/IKObj'
import { DOWN, LEFT, RIGHT } from '../constants/Vector3Constants'
import { spin_bone_forward, align_chain, align_bone_forward } from '../functions/IKFunctions'
import { Entity } from '../../ecs/classes/Entity'

export type PoseBoneLocalState = {
  bone: Bone
  parent: Bone | null
  chg_state: number // If Local Has Been Updated
  idx: number // Bone Index in Armature
  p_idx: number | null // Parent Bone Index in Armature
  length: number // Length of Bone
  name: string
  local: {
    position: Vector3
    quaternion: Quaternion
    scale: Vector3
  } // Local Transform, use Bind pose as default
  world: {
    position: Vector3
    quaternion: Quaternion
    scale: Vector3
  } // Model Space Transform
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
    align_chain(this, DOWN, b_names)
    return this
  }
  align_arm_left(b_names: string[]) {
    align_chain(this, LEFT, b_names)
    return this
  }
  align_arm_right(b_names: string[]) {
    align_chain(this, RIGHT, b_names)
    return this
  }

  align_foot(b_name: string) {
    spin_bone_forward(this, b_name)
    align_bone_forward(this, b_name)
    return this
  }

  spin_bone_forward(b_name: string) {
    spin_bone_forward(this, b_name)
    return this
  }
  align_bone_forward(b_name: string) {
    align_bone_forward(this, b_name)
    return this
  }

  constructor(entity: Entity, clone: boolean) {
    this.entity = entity
    this.bones = []
    const armature = getComponent(entity, IKObj).ref
    const parent: Object3D = clone ? SkeletonUtils.clone(armature.parent) : armature.parent
    this.skeleton = this.get_skeleton(parent.children) // Recreation of Bone Hierarchy

    // this.bones = this.skeleton.bones
    this.rootOffset = new Object3D() // Parent Transform for Root Bone ( Skeletons from FBX imports need this to render right )

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Create Bone Transform Hierarchy to do transformations
    // without changing the actual armature.
    for (let i = 0; i < this.skeleton.bones.length; i++) {
      const b = this.skeleton.bones[i]
      let p_idx, boneParent
      if (b.parent && b.parent instanceof Bone) {
        p_idx = this.skeleton.bones.indexOf(b.parent)
        boneParent = b.parent
      }

      this.bones[i] = {
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
          scale: new Vector3()
        } // Model Space Transform
      }

      b.getWorldPosition(this.bones[i].world.position)
      b.getWorldQuaternion(this.bones[i].world.quaternion)
      b.getWorldScale(this.bones[i].world.scale)

      //b['index'] = i
      if (b.children.length > 0) {
        const bWorldPosition = new Vector3()
        const bChildWorldPosition = new Vector3()
        b.getWorldPosition(bWorldPosition)
        b.children[0].getWorldPosition(bChildWorldPosition)
        this.bones[i].length = bWorldPosition.distanceTo(bChildWorldPosition)
      }
    }

    this.skeleton.update()
  }

  get_skeleton(objects: (Object3D | SkinnedMesh)[]): Skeleton {
    return (objects.find((skin) => skin instanceof SkinnedMesh && skin.skeleton != null) as SkinnedMesh).skeleton
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
    return this.bones.find((b) => b.name === name)
  }

  apply(): Pose {
    // Copies modified LquatInverseocal Transforms of the Pose to the Bone Entities.
    const targetSkeleton: Skeleton = getComponent(this.entity, IKObj).ref.skeleton

    let pb: Bone, // Pose Bone
      o: Bone // Bone Object
    for (let i = 0; i < targetSkeleton.bones.length; i++) {
      pb = this.skeleton.bones[i]

      // Check if bone has been modified in the pose
      o = targetSkeleton.bones[i]
      // Copy changes to Bone Entity
      o.setRotationFromQuaternion(pb.quaternion)

      o.position.copy(pb.position)
      o.scale.copy(pb.scale)
    }
    this.skeleton.update()
    targetSkeleton.update()
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

  getParentRoot(boneIndex: number): Quaternion {
    // ORIGINAL CODE
    // get_parent_rot( b_idx, q=null ){
    // 	let cbone = this.bones[ b_idx ];
    // 	q = q || new Quat();

    const bone = this.skeleton.bones[this.bones[boneIndex].idx]
    const q = new Quaternion()

    // ORIGINAL CODE
    //if( cbone.p_idx == null ) q.reset();
    // Child is a Root Bone, just reset since there is no parent.
    if (bone.parent == null) q.identity()
    else {
      // ORIGINAL CODE
      // let b = this.bones[ cbone.p_idx ];
      // 	q.copy( b.local.rot );

      // 	while( b.p_idx != null ){
      // 		b = this.bones[ b.p_idx ];
      // 		q.pmul( b.local.rot );
      // 	}
      // Parents Exist, loop till reaching the root
      let b = bone.parent
      q.copy(b.quaternion)
      while (b.parent != null && b.parent.type === 'Bone') {
        b = b.parent
        q.premultiply(b.quaternion)
      }
    }
    // ORIGINAL CODE
    // q.pmul( this.root_offset.rot ); // Add Starting Offset
    q.premultiply(this.rootOffset.quaternion) // Add Starting Offset
    return q
  }
}

export default Pose
