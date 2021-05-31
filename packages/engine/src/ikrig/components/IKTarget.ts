import Axis from "../math/Axis";
import { Component } from "../../ecs/classes/Component";
import Vec3 from "../math/Vec3";
import Quat from "../math/Quat";

function LawCosinesSSS( aLen, bLen, cLen ){
	// Law of Cosines - SSS : cos(C) = (a^2 + b^2 - c^2) / 2ab
	// The Angle between A and B with C being the opposite length of the angle.
	let v = ( aLen*aLen + bLen*bLen - cLen*cLen ) / ( 2 * aLen * bLen );
	if( v < -1 )		v = -1;	// Clamp to prevent NaN Errors
	else if( v > 1 )	v = 1;
	return Math.acos( v );
}
class IKTarget extends Component<IKTarget>{
	startPosition: Vec3 = new Vec3();
	endPosition: Vec3 = new Vec3();
	axis: Axis = new Axis();
	magnitudeSquared = 0;
	length = 0;

	/** Define the target based on a Start and End Position along with
		Up direction or the direction of the bend. */
	fromPosition(pA, pB, up_dir) {
		this.startPosition.copy(pA);
		this.endPosition.copy(pB);

		this.magnitudeSquared = this.axis.z.setFromSubtract(pB, pA).magnitudeSquared();
		this.length = Math.sqrt(this.magnitudeSquared);

		this.axis.fromDirection(this.axis.z, up_dir);
		return this;
	}

	fromPositionAndDirection(position, dir, up_dir, len_scl) {
		this.startPosition.copy(position);
		this.endPosition
			.setFromScale(dir, len_scl)	// Compute End Effector
			.add(position);

		this.magnitudeSquared = Vec3.magnitudeSquared(position, this.endPosition);
		this.length = Math.sqrt(this.magnitudeSquared);

		this.axis.fromDirection(dir, up_dir); // Target Axis
		return this;
	}

	/** Visually see the Target information */
	debug(d, scale = 1.0) {
		const v = new Vec3(),
			p = this.startPosition,
			a = this.axis;
		d.setLine(p, v.setFromScale(a.z, scale).add(p), "green")
			.setLine(p, v.setFromScale(a.x, scale).add(p), "red")
			.setLine(p, v.setFromScale(a.y, scale).add(p), "blue")
			.setPoint(p, "green", 0.05, 1)
			.setPoint(this.endPosition, "red", 0.05, 1);
		return this;
	}


	aimBone(chain, tpose, p_wt, out) {
		const rotation = Quat.multiply(p_wt.rotation, tpose.getLocalRotation(chain.first())),	// Get World Space Rotation for Bone
			dir = Vec3.transformQuat(chain.alt_fwd, rotation);					// Get Bone's WS Forward Dir
		//Swing
		const q = Quat.rotationFromUnitVectors(dir, this.axis.z);
		out.setFromMultiply(q, rotation);

		dir.fromQuaternion(out, chain.alt_up);				// After Swing, Whats the UP Direction
		let twist = Vec3.angle(dir, this.axis.y);	// Get difference between Swing Up and Target Up

		if (twist <= 0.00017453292) twist = 0;
		else {
			dir.setFromCross(dir, this.axis.z);	// Get Swing LEFT, used to test if twist is on the negative side.
			if (Vec3.dot(dir, this.axis.y) >= 0) twist = -twist;
		}

		out.premultiplyAxisAngle(this.axis.z, twist);	// Apply Twist
	}

	limb(chain, tpose, pose, p_wt) {
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Using law of cos SSS, so need the length of all sides of the triangle
		const bind_a = tpose.bones[chain.bones[0].index],	// Bone Reference from Bind
			bind_b = tpose.bones[chain.bones[1].index],
			pose_a = pose.bones[chain.bones[0].index],		// Bone Reference from Pose
			pose_b = pose.bones[chain.bones[1].index],
			aLen = bind_a.length,
			bLen = bind_b.length,
			cLen = this.length,
			rotation = new Quat();
		let rad;

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// FIRST BONE - Aim then rotate by the angle.
		this.aimBone(chain, tpose, p_wt, rotation);				// Aim the first bone toward the target oriented with the bend direction.

		rad = LawCosinesSSS(aLen, cLen, bLen);				// Get the Angle between First Bone and Target.

		rotation.premultiplyAxisAngle(this.axis.x, -rad)				// Use the Target's X axis for rotation along with the angle from SSS
			.premultiplyInvert(p_wt.rotation);							// Convert to Bone's Local Space by multiply invert of parent bone rotation

		pose.setBone(bind_a.index, rotation);						// Save result to bone.
		pose_a.world											// Update World Data for future use
			.copy(p_wt)
			.add(rotation, bind_a.local.position, bind_a.local.scale);

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// SECOND BONE
		// Need to rotate from Right to Left, So take the angle and subtract it from 180 to rotate from 
		// the other direction. Ex. L->R 70 degrees == R->L 110 degrees
		rad = Math.PI - LawCosinesSSS(aLen, bLen, cLen);

		rotation.setFromMultiply(pose_a.world.rotation, bind_b.local.rotation)		// Add Bone 2's Local Bind Rotation to Bone 1's new World Rotation.
			.premultiplyAxisAngle(this.axis.x, rad)				// Rotate it by the target's x-axis
			.premultiplyInvert(pose_a.world.rotation);					// Convert to Bone's Local Space

		pose.setBone(bind_b.index, rotation);						// Save result to bone.
		pose_b.world											// Update World Data for future use
			.copy(pose_a.world)
			.add(rotation, bind_b.local.position, bind_b.local.scale);
	}

}

export default IKTarget;