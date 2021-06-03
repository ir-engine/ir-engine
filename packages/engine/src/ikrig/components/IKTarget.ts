import { Quaternion, Vector3 } from "three";
import Axis from "../math/Axis";

function LawCosinesSSS( aLen, bLen, cLen ){
	// Law of Cosines - SSS : cos(C) = (a^2 + b^2 - c^2) / 2ab
	// The Angle between A and B with C being the opposite length of the angle.
	let v = ( aLen*aLen + bLen*bLen - cLen*cLen ) / ( 2 * aLen * bLen );
	if( v < -1 )		v = -1;	// Clamp to prevent NaN Errors
	else if( v > 1 )	v = 1;
	return Math.acos( v );
}
class IKTarget{
	startPosition: Vector3 = new Vector3();
	endPosition: Vector3 = new Vector3();
	axis: Axis = new Axis();
	length = 0;

	fromPositionAndDirection(position: Vector3, dir: Vector3, up_dir: Vector3, lengthScale: number) {
		this.startPosition.copy(position);
		console.log("position, dir, up_dir, len_scl");
		console.log(position, dir, up_dir, lengthScale)
		this.endPosition = dir.multiplyScalar( lengthScale)	// Compute End Effector
			.add(position);
		const length = position.distanceTo(this.endPosition)

		this.axis.fromDirection(dir, up_dir); // Target Axis
		return this;
	}

	/** Visually see the Target information */
	debug(d, scale = 1.0) {
		const v = new Vector3(),
			p = this.startPosition,
			a = this.axis;
		d.setLine(p, a.z.multiplyScalar(scale).add(p), "green")
			.setLine(p, a.x.multiplyScalar(scale).add(p), "red")
			.setLine(p, a.y.multiplyScalar(scale).add(p), "blue")
			.setPoint(p, "green", 0.05, 1)
			.setPoint(this.endPosition, "red", 0.05, 1);
		return this;
	}


	tempQ = new Quaternion();

	limb(chain, tpose, pose, p_wt) {
		console.log("tpose.bones", tpose.bones);
		console.log("chain.bones[0]", chain.bones[0])
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Using law of cos SSS, so need the length of all sides of the triangle
		const bind_a = tpose.bones[chain.bones[0].index],	// Bone Reference from Bind
			bind_b = tpose.bones[chain.bones[1].index],
			pose_a = pose.bones[chain.bones[0].index],		// Bone Reference from Pose
			pose_b = pose.bones[chain.bones[1].index]
		console.log("bind_a is", bind_a)
		let
			aLen = bind_a.length,
			bLen = bind_b.length,
			cLen = this.length;
			let quaternion = new Quaternion();
		let rad;





		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Aim then rotate by the angle.
		// Aim the first bone toward the target oriented with the bend direction.
		
		// TODO: Is this the right mult order?
		let rot	= p_wt.quaternion.multiply(tpose.bones[chain.first()].quaternion )

		console.log("rot is ", rot);

		console.log("chain.alt_fwd is", chain.alt_fwd);

		console.log('chain is', chain);
		//Swing
		let dir = chain.alt_fwd.applyQuaternion(rot);					// Get Bone's WS Forward Dir

		// TODO: Check the original reference and make sure this is valid
		const q = new Quaternion();
		q.setFromUnitVectors(dir, this.axis.z);
		console.log("dir is", dir)
		console.log("q is ", q);
		quaternion = q.multiply(rot);
		console.log("quaternion is", quaternion)

		quaternion = dir.applyQuaternion( chain.alt_up);				// After Swing, Whats the UP Direction
		let twist = dir.angleTo(this.axis.y);	// Get difference between Swing Up and Target Up

		if (twist <= 0.00017453292) twist = 0;
		else {
			dir.cross(this.axis.z);	// Get Swing LEFT, used to test if twist is on the negative side.
			if (dir.dot(this.axis.y) >= 0) twist = -twist;
		}

		this.tempQ = this.tempQ.setFromAxisAngle(this.axis.z, twist);	// Apply Twist
		quaternion = quaternion.premultiply(this.tempQ);

		rad = LawCosinesSSS(aLen, cLen, bLen);				// Get the Angle between First Bone and Target.
		
		this.tempQ = this.tempQ.setFromAxisAngle(this.axis.x, -rad)	// Use the Target's X axis for quaternion along with the angle from SSS
		
		this.tempQ = this.tempQ.premultiply(quaternion) // Premultiply by original value
		this.tempQ = this.tempQ.premultiply(p_wt.quaternion.inverse());							// Convert to Bone's Local Space by multiply invert of parent bone quaternion

		pose.setBone(bind_a.index, quaternion);						// Save result to bone.
		pose_a.world											// Update World Data for future use
			.copy(p_wt)
			.add(quaternion, bind_a.position, bind_a.scale);

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// SECOND BONE
		// Need to rotate from Right to Left, So take the angle and subtract it from 180 to rotate from 
		// the other direction. Ex. L->R 70 degrees == R->L 110 degrees
		rad = Math.PI - LawCosinesSSS(aLen, bLen, cLen);

		quaternion = pose_a.world.quaternion.multiply(bind_b.quaternion)		// Add Bone 2's Local Bind Rotation to Bone 1's new World Rotation.
			.premultiplyAxisAngle(this.axis.x, rad)				// Rotate it by the target's x-axis
			.premultiplyInvert(pose_a.world.quaternion);					// Convert to Bone's Local Space

		pose.setBone(bind_b.index, quaternion);						// Save result to bone.
		pose_b.world											// Update World Data for future use
			.copy(pose_a.world)
			.add(quaternion, bind_b.local.position, bind_b.local.scale);
	}

}

export default IKTarget;