import { Object3D, Quaternion, Skeleton, Vector3 } from "three";
import { Transform } from "three-physx";
import { SkeletonUtils } from "../../character/SkeletonUtils";
import { getMutableComponent } from "../../ecs/functions/EntityFunctions";
import Obj from "../components/Obj";
import { DOWN, FORWARD, LEFT, RIGHT } from "../constants/Vector3Constants";

class Pose {
	static ROTATION: any = 1;;
	static POSITION: any = 2;;
	static SCALE: any = 4;;

	entity: any;
	skeleton: Skeleton;
	bones: any[];
	rootOffset = {
		quaternion: new Quaternion(),
		position: new Vector3(0, 0, 0),
		scale: new Vector3(1, 1, 1)
	};
	helper: any;

	align_leg( b_names ){  align_chain( this, DOWN, b_names ); return this; }
	align_arm_left( b_names ){ align_chain( this, LEFT, b_names ); return this; }
	align_arm_right( b_names ){ align_chain( this, RIGHT, b_names ); return this; }

	// align_foot( b_name ){
	// 	spin_bone_forward( this.pose, b_name );
	// 	align_bone_forward( this.pose, b_name );
	// 	return this; 
	// }

	// spin_bone_forward( b_name ){ spin_bone_forward( this.pose, b_name ); return this; }
	// align_bone_forward( b_name ){ align_bone_forward( this.pose, b_name ); return this; }

	constructor(entity) {
		this.entity = entity;
		const armature = getMutableComponent(entity, Obj).ref;
		this.skeleton = SkeletonUtils.clone(armature.parent).children.find(skin => skin.skeleton != null).skeleton;	// Recreation of Bone Hierarchy
		console.log("this.skeleton", this.skeleton)
		
		this.bones = this.skeleton.bones;
		this.rootOffset = new Object3D();					// Parent Transform for Root Bone ( Skeletons from FBX imports need this to render right )
		for (let i = 0; i < this.skeleton.bones.length; i++) {
			this.skeleton.bones['index'] = i;
		}
	}

	setOffset(quaternion: Quaternion, position: Vector3, scale: Vector3) {
		this.rootOffset.quaternion.copy(quaternion);
		this.rootOffset.position.copy(position);
		this.rootOffset.scale.copy(scale);
		return this;
	}

	setBone(index: number, quaternion?: Quaternion, position?: Vector3, scale?: Vector3) {
		if(quaternion) this.bones[index].quaternion.copy(quaternion);
		if(position) this.bones[index].position.copy(position);
		if(scale) this.bones[index].scale.copy(scale);
		return this;
	}

	apply() {
		// Copies modified LquatInverseocal Transforms of the Pose to the Bone Entities.
		const targetSkeleton:Skeleton = getMutableComponent(this.entity, Obj).ref.skeleton;

		let pb, // Pose Bone
			o;	// Bone Object
		this.skeleton.update();
		targetSkeleton.update();
		for (let i = 0; i < targetSkeleton.bones.length; i++) {
			// Check if bone has been modified in the pose
			pb = targetSkeleton.bones[i];
			
			// Copy changes to Bone Entity
			o = this.skeleton.bones[i];

			o.setRotationFromQuaternion(pb.quaternion);
			o.position.copy(pb.position);
		 	o.scale.copy(pb.scale);
		}
		this.skeleton.update();
		targetSkeleton.update();

		return this;
	}

	getParentWorld(boneIndex, t_offset = null) {
		// The IK Solver takes transforms as input, not rotations.
		// The first thing we need is the WS Transform of the start of the chain
		// plus the parent's WS Transform. When are are building a full body IK
		// We need to do things in a certain order to build things correctly.
		// So before we can do legs, we need the hip/root to be moved to where it needs to go
		// The issue is that when people walk, you are actually falling forward, you catch
		// yourself when your front foot touches the floor, in the process you lift yourself 
		// up a bit. During a whole walk, or run cycle, a person's hip is always moving up and down
		// Because of that, the distance from the Hip to the floor is constantly changing
		// which is important if we want to have the legs stretch correctly since each IK leg
		// length scale is based on the hip being at a certain height at the time.
		let parentTransform = new Transform(),
			childTransform = new Transform();
		console.log("incomingBone is", boneIndex)
		console.log("this.bones is", this.bones);
		let bone = this.bones[boneIndex];

		// Child is a Root Bone, just reset since there is no parent.
		if (!bone) {
			// TODO: Clear pos/rot/scale of parent
			parentTransform.clear();
		} else {
			while (bone.parent != null) {
				bone = bone.parent;
				console.log("Bone is", bone);
				this.addInReverseOrder(bone);
			}
		}

		this.addInReverseOrder(this.rootOffset);				// Add Starting Offset
		if (t_offset) this.addInReverseOrder(t_offset);		// Add Additional Starting Offset
		console.log('bone is ', bone)
		this.setChildFromParent(parentTransform, bone);	// Requesting Child WS Info Too

		return this;
	}

	// If these are temp vars okay, but these might need to move to the bones?? Do we need these if we have world poses on bones?
	parentQuaternion = new Quaternion()
	parentScale = new Vector3(1,1,1)
	parentPosition = new Vector3(0,0,0)

	childQuaternion = new Quaternion()
	childScale = new Vector3(1,1,1)
	childPosition = new Vector3(0,0,0)

	// Make sure this is properly named
	setChildFromParent(parent, child) {
		console.log("parent, child", parent, child)

		// POSITION - parent.position + ( parent.quaternion * ( parent.scale * child.position ) )
		// TODO: Make sure this matrix isn't flipped
		const v: Vector3 = new Vector3().copy(parent.scale)
			.multiply(child.position) // parent.scale * child.position;
			.applyQuaternion(parent.quaternion); //Vec3.transformQuat( v, tp.quaternion, v );
		this.childPosition = new Vector3().copy(parent.position).add(v); // Vec3.add( tp.position, v, this.position );

		console.log("v is", v);
		console.log("this.childPosition", this.childPosition);

		// SCALE - parent.scale * child.scale
		// TODO: not flipped, right?
		this.childScale = new Vector3().copy(parent.scale).multiply(child.scale);

		// ROTATION - parent.quaternion * child.quaternion
		this.childQuaternion = new Quaternion().copy(parent.quaternion).multiply(child.quaternion);

		return this;
	}

	// Computing Transforms in reverse, Child - > Parent
	addInReverseOrder(parent) {
		console.log("parent", parent);

		// POSITION - parent.position + ( parent.quaternion * ( parent.scale * child.position ) )
		// The only difference for this func, We use the IN.scale & IN.quaternion instead of THIS.scale * THIS.quaternion
		// Consider that this Object is the child and the input is the Parent.
		this.parentPosition.multiply(parent.scale).applyQuaternion(parent.quaternion).add(parent.position);
		this.parentScale.multiply(parent.scale);
		// ROTATION - parent.quaternion * child.quaternion
		this.parentQuaternion.premultiply(parent.quaternion); // Must Rotate from Parent->Child, need PMUL

		return this
	}

	getParentRoot(boneIndex) {
		// ORIGINAL CODE
		// get_parent_rot( b_idx, q=null ){
		// 	let cbone = this.bones[ b_idx ];
		// 	q = q || new Quat();

		const bone = this.bones[boneIndex];
		const q = new Quaternion();

		// ORIGINAL CODE
		//if( cbone.p_idx == null ) q.reset();
		// Child is a Root Bone, just reset since there is no parent.
		if ((bone.parent == null)) q.identity();
		else {
			// ORIGINAL CODE
			// let b = this.bones[ cbone.p_idx ];
			// 	q.copy( b.local.rot );

			// 	while( b.p_idx != null ){
			// 		b = this.bones[ b.p_idx ];
			// 		q.pmul( b.local.rot );
			// 	}
			// Parents Exist, loop till reaching the root
			let b = bone.parent;
			q.copy(b.quaternion);
			while (b.parent != null && b.parent.type === "Bone") {
				b = b.parent;
				q.premultiply(b.quaternion);
			}
		}
		// ORIGINAL CODE
		// q.pmul( this.root_offset.rot ); // Add Starting Offset
		q.premultiply(this.rootOffset.quaternion); // Add Starting Offset
		return q;
	}
}

function align_chain( pose, dir, b_names ){
	let aEnd	= b_names.length - 1,				// End Index
		forwardDir		= new Vector3(),					// Forward
		upDir		= new Vector3().copy(dir),				// Up
		leftDir		= new Vector3(),					// Left
		finalRotation		= new Quaternion()					// Final Rotation
		
	const parentWorldQ = new Quaternion();
	const parentWorldP = new Vector3();
	const parentWorldS = new Vector3();

	const childWorldQ = new Quaternion();
	const childWorldP = new Vector3();
	const childWorldS = new Vector3();

	for( let i=0; i <= aEnd; i++ ){
		let bone: Object3D = pose.bones.find( bone => bone.name = b_names[i] );	// Bone Reference

		bone.getWorldQuaternion(parentWorldQ);
		bone.getWorldPosition(parentWorldP);
		bone.getWorldScale(parentWorldS);
	
		bone.getWorldQuaternion(childWorldQ);
		bone.getWorldPosition(childWorldP);
		bone.getWorldScale(childWorldS);

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Up direction is where we need the bone to point to.
		// We then get the bone's current forward direction, use it
		// to get its left, then finish it off by recalculating
		// fwd to make it orthogonal. Want to try to keep the orientation
		// while ( fwd, lft ) realigning the up direction.
		// Original code
		// f.from_quat( ct.rot, Vec3.FORWARD ); 		// Find Bone's Forward World Direction
		// leftDir.from_cross( upDir, forwardDir ).norm();				// Get World Left
		// forwardDir.from_cross( leftDir, upDir ).norm();				// Realign Forward
		forwardDir.copy(FORWARD).applyQuaternion(childWorldQ)
		leftDir.copy(upDir).cross(forwardDir).normalize();
		forwardDir.copy(leftDir).cross(upDir).normalize();

		from_axis(finalRotation, leftDir, upDir, forwardDir );						// Create Rotation from 3x3 rot Matrix
		const tempQuat = new Quaternion().copy(finalRotation);

		if( tempQuat.dot(childWorldQ) < 0 ) negate(finalRotation);	// Do a Inverted rotation check, negate it if under zero.
		
		//r.pmul( q.from_invert( pt.rot ) );		// Move rotation to local space
		pmul_invert(finalRotation, parentWorldQ );					// Move rotation to local space
		// pose.set_bone( bone.idx, finalRotation );					// Update Pose with new ls rotation
		bone.setRotationFromQuaternion(finalRotation);
		
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// If not the last bone, take then the new rotation to calc the next parents
		// world space transform for the next bone on the list.
		if( i != aEnd){

		// pt.add( finalRotation, bone.local.pos, bone.local.scl );
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// POSITION - parent.position + ( parent.rotation * ( parent.scale * child.position ) )
			const t = new Vector3().copy(childWorldP).add(new Vector3().copy(childWorldS).multiply(bone.position ))
			transform_quat(t, childWorldQ );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// SCALE - parent.scale * child.scale
			parentWorldS.multiply( bone.scale );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// ROTATION - parent.rotation * child.rotation
			parentWorldQ.multiply( finalRotation );

			bone = pose.bones.find( bone => bone.name = b_names[i+1] ) as Object3D;	// Bone Reference
			bone.position.copy(parentWorldP);
			bone.quaternion.copy(parentWorldQ);
			bone.scale.copy(parentWorldS);
		}
	}
}

function transform_quat( t, q ){ 
	let qx = q[0], qy = q[1], qz = q[2], qw = q[3],
		vx = t[0], vy = t[1], vz = t[2],
		x1 = qy * vz - qz * vy,
		y1 = qz * vx - qx * vz,
		z1 = qx * vy - qy * vx,
		x2 = qw * x1 + qy * z1 - qz * y1,
		y2 = qw * y1 + qz * x1 - qx * z1,
		z2 = qw * z1 + qx * y1 - qy * x1;

		t[0] = vx + 2 * x2;
		t[1] = vy + 2 * y2;
		t[2] = vz + 2 * z2;
}

function pmul_invert( qO, q ){
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// q.invert()
	let ax		= q[0],	
		ay		= q[1],
		az		= q[2],
		aw		= q[3],
		dot 	= ax*ax + ay*ay + az*az + aw*aw;

	if( dot == 0 ){
		ax = ay = az = aw = 0;
	}else{
		let dot_inv = 1.0 / dot;
		ax = -ax * dot_inv;
		ay = -ay * dot_inv;
		az = -az * dot_inv;
		aw =  aw * dot_inv;
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Quat.mul( a, b );
	let bx		= qO[0],	
		by		= qO[1],
		bz		= qO[2],
		bw		= qO[3];
	qO[0]	= ax * bw + aw * bx + ay * bz - az * by;
	qO[1]	= ay * bw + aw * by + az * bx - ax * bz;
	qO[2]	= az * bw + aw * bz + ax * by - ay * bx;
	qO[3]	= aw * bw - ax * bx - ay * by - az * bz;
}

function negate( q ){
	q[0] = -q[0];
	q[1] = -q[1];
	q[2] = -q[2];
	q[3] = -q[3];
	return q;
}


function from_axis(out, xAxis, yAxis, zAxis ){
	let m00 = xAxis.x, m01 = xAxis.y, m02 = xAxis.z,
		m10 = yAxis.x, m11 = yAxis.y, m12 = yAxis.z,
		m20 = zAxis.x, m21 = zAxis.y, m22 = zAxis.z,
		t = m00 + m11 + m22,
		x, y, z, w, s;

	if(t > 0.0){
		s = Math.sqrt(t + 1.0);
		w = s * 0.5 ; // |w| >= 0.5
		s = 0.5 / s;
		x = (m12 - m21) * s;
		y = (m20 - m02) * s;
		z = (m01 - m10) * s;
	}else if((m00 >= m11) && (m00 >= m22)){
		s = Math.sqrt(1.0 + m00 - m11 - m22);
		x = 0.5 * s;// |x| >= 0.5
		s = 0.5 / s;
		y = (m01 + m10) * s;
		z = (m02 + m20) * s;
		w = (m12 - m21) * s;
	}else if(m11 > m22){
		s = Math.sqrt(1.0 + m11 - m00 - m22);
		y = 0.5 * s; // |y| >= 0.5
		s = 0.5 / s;
		x = (m10 + m01) * s;
		z = (m21 + m12) * s;
		w = (m20 - m02) * s;
	}else{
		s = Math.sqrt(1.0 + m22 - m00 - m11);
		z = 0.5 * s; // |z| >= 0.5
		s = 0.5 / s;
		x = (m20 + m02) * s;
		y = (m21 + m12) * s;
		w = (m01 - m10) * s;
	}

	out.x = x;
	out.y = y;
	out.z = z;
	out.w = w;
	return out;
}

// function spin_bone_forward( pose, foot ){
// 	let pt	= new Transform(),
// 		ct	= new Transform(),
// 		v	= new Vec3(),
// 		q	= new Quat(),
// 		b	= pose.get_bone( foot );

// 	pose.get_parent_world( b.idx, pt, ct );		// Get the Parent and Child Transforms. e.Armature,
	
// 	ct.transform_vec( [0,b.len,0], v );			// Get the Tails of the Bone
// 	v.sub( ct.pos );							// Get The direction to the tail
// 	v[1] = 0;									// Flatten vector to 2D by removing Y Position
// 	v.norm();									// Make it a unit vector
// 	q	.from_unit_vecs( v, Vec3.FORWARD )		// Rotation needed to point the foot forward.
// 		.mul( ct.rot )							// Move WS Foot to point forward
// 		.pmul_invert( pt.rot );					// To Local Space
// 	pose.set_bone( b.idx, q );					// Save to Pose
// }

// function align_bone_forward( pose, b_name ){
// 	let pt	= new Transform(),
// 		ct	= new Transform(),
// 		v 	= new Vec3(),
// 		q 	= new Quat(),
// 		b	= pose.get_bone( b_name );

// 	pose.get_parent_world( b.idx, pt, ct ); // Get Bone's World Transform and its Parent.

// 	v.from_quat( ct.rot, Vec3.UP );			// Get Bone's WS UP Direction
	
// 	q	.from_unit_vecs( v, Vec3.FORWARD )	// Difference between Current UP and WS Forward
// 		.mul( ct.rot )						// PreMul Difference to Current Rotation
// 		.pmul_invert( pt.rot );				// Convert to Local Space

// 	pose.set_bone( b.idx, q );				// Save to Pose
// }

export default Pose;