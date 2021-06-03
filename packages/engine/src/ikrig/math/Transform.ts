// http://gabormakesgames.com/blog_transforms_transforms.html

import { Vector3, Quaternion } from "three";
import { Component } from "../../ecs/classes/Component";

class Transform extends Component<Transform>{
	position: Vector3 = new Vector3();
	quaternion: Quaternion  = new Quaternion();
	scale: Vector3 = new Vector3(1, 1, 1);
	constructor() {
		super();
		this.quaternion = new Quaternion();
		this.position = new Vector3();
		this.scale = new Vector3(1, 1, 1);
	}

	copy(t) {
		this.quaternion.copy(t.quaternion);
		this.position.copy(t.position);
		this.scale.copy(t.scale);
		return this;
	}

	set(r = null, p = null, s = null) {
		if (r) this.quaternion.copy(r);
		if (p) this.position.copy(p);
		if (s) this.scale.copy(s);
		return this;
	}

	setFromAdd(parent, child) {
		console.log("parent, child", parent, child)
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// POSITION - parent.position + ( parent.quaternion * ( parent.scale * child.position ) )
		// TODO: Make sure this matrix isn't flipped
		const v: Vector3 = parent.scale.multiply(child.position); // parent.scale * child.position;
		v.applyQuaternion(parent.quaternion); //Vec3.transformQuat( v, tp.quaternion, v );
		this.position = parent.position.add(v); // Vec3.add( tp.position, v, this.position );

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// SCALE - parent.scale * child.scale
		// TODO: not flipped, right?
		this.scale = parent.scale.multiply(child.scale);

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// ROTATION - parent.quaternion * child.quaternion
		this.quaternion = parent.quaternion.multiply(child.quaternion);

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		return this;
	}

	// Computing Transforms, Parent -> Child
	add(cr, cp?, cs = null) {
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// If just passing in Tranform Object
		if (arguments.length == 1) {
			cr = arguments[0].quaternion;
			cp = arguments[0].position;
			cs = arguments[0].scale;
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// POSITION - parent.position + ( parent.quaternion * ( parent.scale * child.position ) )
		// TODO: Multiplied in proper order?
		this.position.add(this.scale.multiply(cp).applyQuaternion(this.quaternion));

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// SCALE - parent.scale * child.scale
		if (cs) this.scale.multiply(cs);

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// ROTATION - parent.quaternion * child.quaternion
		this.quaternion.multiply(cr);

		return this;
	}

	// Computing Transforms in reverse, Child - > Parent
	add_rev(pr) {
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			console.log("pr", pr);
			let pq = pr.quaternion;
			let pp = pq.position;
			let ps = pq.scale;

		// //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// // POSITION - parent.position + ( parent.quaternion * ( parent.scale * child.position ) )
		// // The only difference for this func, We use the IN.scale & IN.quaternion instead of THIS.scale * THIS.quaternion
		// // Consider that this Object is the child and the input is the Parent.
		// this.position.multiply(ps).applyQuaternion(pq).add(pp);

		// //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// // SCALE - parent.scale * child.scale
		// if (ps) this.scale.multiply(ps);

		// //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// // ROTATION - parent.quaternion * child.quaternion
		// this.quaternion.premultiply(pq); // Must Rotate from Parent->Child, need PMUL

		return this
	}

	add_pos(cp, ignore_scl = false) {
		//POSITION - parent.position + ( parent.quaternion * ( parent.scale * child.position ) )
		if (ignore_scl) this.position.add(cp.applyQuaternion(this.quaternion));
		else this.position.add(new Vector3(cp).applyQuaternion(this.quaternion));
		return this;
	}

	clear() {
		this.position.set(0, 0, 0);
		this.scale.set(1, 1, 1);
		this.quaternion.set(1,0,0,0);
		return this;
	}

	transform_vec(v, out = null) {
		//GLSL - vecQuatRotation(model.quaternion, a_position.xyz * model.scale) + model.position;
		return (out || v)
			.setFromMultiply(v, this.scale)
			.applyQuaternion(this.quaternion)
			.add(this.position);
	}

	dispose() {
		delete this.position;
		delete this.quaternion;
		delete this.scale;
	}

	static add(tp, tc, tOut) {
		tOut = tOut || new Transform();

		tOut.position.setFromAdd(tp.position, new Vector3(tc.position).applyQuaternion(tp.quaternion));

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// SCALE - parent.scale * child.scale
		tOut.scale.setFromMultiply(tp.scale, tc.scale); //Vec3.multiply( tp.scale, tc.scale, tOut.scale );

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// ROTATION - parent.quaternion * child.quaternion
		tOut.quaternion.setFromMultiply(tp.quaternion, tc.quaternion); //Quat.multiply( tp.quaternion, tc.quaternion, tOut.quaternion );

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		return tOut;
	}

	static invert(t, inv) {
		inv = inv || new Transform();

		// Invert Rotation
		t.quaternion.invert(inv.quaternion);

		// Invert Scale
		inv.scale.x = (t.scale.x != 0) ? 1 / t.scale.x : 0;
		inv.scale.y = (t.scale.y != 0) ? 1 / t.scale.y : 0;
		inv.scale.z = (t.scale.z != 0) ? 1 / t.scale.z : 0;

		// Invert Position : rotInv * ( invScl * invPos )
		t.position.invert(inv.position).multiply(inv.scale);
		inv.position.applyQuaternion(inv.quaternion);

		return inv;
	}
}

export default Transform;