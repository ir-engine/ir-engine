import { Object3D, Quaternion, Skeleton, Vector3 } from 'three'
import { SkeletonUtils } from '../../avatar/SkeletonUtils'
import { getMutableComponent } from '../../ecs/functions/EntityFunctions'
import Obj from '../components/Obj'
import { DOWN, LEFT, RIGHT } from '../constants/Vector3Constants'
import { spin_bone_forward, align_chain, align_bone_forward } from '../functions/IKFunctions'

class Pose {
  static ROTATION: any = 1
  static POSITION: any = 2
  static SCALE: any = 4

  entity: any
  skeleton: Skeleton
  bones: any[]
  rootOffset = {
    quaternion: new Quaternion(),
    position: new Vector3(0, 0, 0),
    scale: new Vector3(1, 1, 1)
  }
  helper: any

  align_leg(b_names) {
    align_chain(this, DOWN, b_names)
    return this
  }
  align_arm_left(b_names) {
    align_chain(this, LEFT, b_names)
    return this
  }
  align_arm_right(b_names) {
    align_chain(this, RIGHT, b_names)
    return this
  }

  align_foot(b_name) {
    spin_bone_forward(this, b_name)
    align_bone_forward(this, b_name)
    return this
  }

  spin_bone_forward(b_name) {
    spin_bone_forward(this, b_name)
    return this
  }
  align_bone_forward(b_name) {
    align_bone_forward(this, b_name)
    return this
  }

  constructor(entity, clone) {
    this.entity = entity
    const armature = getMutableComponent(entity, Obj).ref
    this.skeleton = clone
      ? SkeletonUtils.clone(armature.parent).children.find((skin) => skin.skeleton != null).skeleton
      : armature.parent.children.find((skin) => skin.skeleton != null).skeleton // Recreation of Bone Hierarchy

    this.bones = this.skeleton.bones
    this.rootOffset = new Object3D() // Parent Transform for Root Bone ( Skeletons from FBX imports need this to render right )
    for (let i = 0; i < this.skeleton.bones.length; i++) {
      const b = this.skeleton.bones[i] as any
      b['index'] = i
      if (b.children.length > 0) {
        const bWorldPosition = new Vector3()
        const bChildWorldPosition = new Vector3()
        b.getWorldPosition(bWorldPosition)
        b.children[0].getWorldPosition(bChildWorldPosition)
        b.length = bWorldPosition.distanceTo(bChildWorldPosition)
      }
    }
    this.skeleton.update()
  }

  setOffset(quaternion: Quaternion, position: Vector3, scale: Vector3) {
    this.rootOffset.quaternion.copy(quaternion)
    this.rootOffset.position.copy(position)
    this.rootOffset.scale.copy(scale)
    return this
  }

  setBone(index: number, quaternion?: Quaternion, position?: Vector3, scale?: Vector3) {
    if (quaternion) this.bones[index].quaternion.copy(quaternion)
    if (position) this.bones[index].position.copy(position)
    if (scale) this.bones[index].scale.copy(scale)
    return this
  }

  apply() {
    // Copies modified LquatInverseocal Transforms of the Pose to the Bone Entities.
    const targetSkeleton: Skeleton = getMutableComponent(this.entity, Obj).ref.skeleton

    let pb, // Pose Bone
      o // Bone Object
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
  setChildFromParent(parent, child) {
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

  getParentRoot(boneIndex) {
    // ORIGINAL CODE
    // get_parent_rot( b_idx, q=null ){
    // 	let cbone = this.bones[ b_idx ];
    // 	q = q || new Quat();

    const bone = this.bones[boneIndex]
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
