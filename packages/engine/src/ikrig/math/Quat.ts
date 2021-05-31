import Vec3 from "./Vec3";

// http://in2gpu.com/2016/03/14/opengl-fps-camera-Quat/
// https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/quat.js
// http://gabormakesgames.com/blog_quats_intro.html
// https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/math/Quat.java
// http://physicsforgames.blogspot.com/2010/03/Quat-tricks.html
// http://physicsforgames.blogspot.com/2010/02/Quats.html
// https://github.com/Unity-Technologies/UnityCsReference/blob/master/Runtime/Export/Quat.cs
// http://bediyap.com/programming/convert-Quat-to-euler-rotations/
// http://schteppe.github.io/cannon.js/docs/files/src_math_Quat.js.html
// https://github.com/mrdoob/three.js/blob/dev/src/math/Quat.js
// http://planning.cs.uiuc.edu/node198.html  uniform random quaternion

class Quat extends Float32Array {
	static ZERO: Quat;
	constructor(q = null) {
		super(4);
		if (q != null && q instanceof Quat) {
			this[0] = q[0];
			this[1] = q[1];
			this[2] = q[2];
			this[3] = q[3];
		} else if (arguments.length == 4) {
			this[0] = arguments[0];
			this[1] = arguments[1];
			this[2] = arguments[2];
			this[3] = arguments[3];
		} else {
			this[0] = this[1] = this[2] = 0;
			this[3] = 1;
		}
	}

	get x() { return this[0]; } set x(val) { this[0] = val; }
	get y() { return this[1]; } set y(val) { this[1] = val; }
	get z() { return this[2]; } set z(val) { this[2] = val; }
	get w() { return this[3]; } set w(val) { this[3] = val; }

	// TODO: Changed to setQuat since set was taken, this could be a bug, if set is called somewhere it will not work unless changed
	setQuat(x, y, z, w) { this[0] = x; this[1] = y; this[2] = z; this[3] = w; return this; }
	copy(q) { this[0] = q[0]; this[1] = q[1]; this[2] = q[2]; this[3] = q[3]; return this; }

	reset() { this[0] = this[1] = this[2] = 0; this[3] = 1; return this; }
	clone() { return new Quat(this); }

	//-------------------------------------------

	fromStruct(o) { this[0] = o.x; this[1] = o.y; this[2] = o.z; this[3] = o.w; return this; }
	toStruct(o) { o.x = this[0]; o.y = this[1]; o.z = this[2]; o.w = this[3]; return this; }

	fromBuf(array, i) {
		this[0] = array[i];
		this[1] = array[i + 1];
		this[2] = array[i + 2];
		this[3] = array[i + 3];
		return this;
	}

	toBuf(array, i) {
		array[i] = this[0];
		array[i + 1] = this[1];
		array[i + 2] = this[2];
		array[i + 3] = this[3];
		return this;
	}

	setFromMultiply(a, b) {
		const ax = a[0], ay = a[1], az = a[2], aw = a[3],
			bx = b[0], by = b[1], bz = b[2], bw = b[3];

		this[0] = ax * bw + aw * bx + ay * bz - az * by;
		this[1] = ay * bw + aw * by + az * bx - ax * bz;
		this[2] = az * bw + aw * bz + ax * by - ay * bx;
		this[3] = aw * bw - ax * bx - ay * by - az * bz;
		return this;
	}

	setFromAxis(xAxis, yAxis, zAxis) {
		const m00 = xAxis[0], m01 = xAxis[1], m02 = xAxis[2],
			m10 = yAxis[0], m11 = yAxis[1], m12 = yAxis[2],
			m20 = zAxis[0], m21 = zAxis[1], m22 = zAxis[2],
			t = m00 + m11 + m22
		let x, y, z, w, s;

		if (t > 0.0) {
			s = Math.sqrt(t + 1.0);
			w = s * 0.5; // |w| >= 0.5
			s = 0.5 / s;
			x = (m12 - m21) * s;
			y = (m20 - m02) * s;
			z = (m01 - m10) * s;
		} else if ((m00 >= m11) && (m00 >= m22)) {
			s = Math.sqrt(1.0 + m00 - m11 - m22);
			x = 0.5 * s;// |x| >= 0.5
			s = 0.5 / s;
			y = (m01 + m10) * s;
			z = (m02 + m20) * s;
			w = (m12 - m21) * s;
		} else if (m11 > m22) {
			s = Math.sqrt(1.0 + m11 - m00 - m22);
			y = 0.5 * s; // |y| >= 0.5
			s = 0.5 / s;
			x = (m10 + m01) * s;
			z = (m21 + m12) * s;
			w = (m20 - m02) * s;
		} else {
			s = Math.sqrt(1.0 + m22 - m00 - m11);
			z = 0.5 * s; // |z| >= 0.5
			s = 0.5 / s;
			x = (m20 + m02) * s;
			y = (m21 + m12) * s;
			w = (m01 - m10) * s;
		}

		this[0] = x;
		this[1] = y;
		this[2] = z;
		this[3] = w;
		return this;
	}

	setFromLookRotation(vDir, vUp) {
		// Ported to JS from C# example at https://pastebin.com/ubATCxJY
		// Note, if Dir and Up are equal, a roll happends. Need to find a way to fix this.
		const zAxis = new Vec3(vDir),	//Forward
			up = new Vec3(vUp),
			xAxis = new Vec3(),		//Right
			yAxis = new Vec3();

		Vec3.cross(up, zAxis, xAxis);
		Vec3.cross(zAxis, xAxis, yAxis); // new up

		xAxis.normalize();
		yAxis.normalize();
		zAxis.normalize();

		//fromAxis - Mat3 to Quat
		const m00 = xAxis.x, m01 = xAxis.y, m02 = xAxis.z,
			m10 = yAxis.x, m11 = yAxis.y, m12 = yAxis.z,
			m20 = zAxis.x, m21 = zAxis.y, m22 = zAxis.z;
		const t = m00 + m11 + m22
		let x, y, z, w, s;

		if (t > 0.0) {
			s = Math.sqrt(t + 1.0);
			w = s * 0.5; // |w| >= 0.5
			s = 0.5 / s;
			x = (m12 - m21) * s;
			y = (m20 - m02) * s;
			z = (m01 - m10) * s;
		} else if ((m00 >= m11) && (m00 >= m22)) {
			s = Math.sqrt(1.0 + m00 - m11 - m22);
			x = 0.5 * s;// |x| >= 0.5
			s = 0.5 / s;
			y = (m01 + m10) * s;
			z = (m02 + m20) * s;
			w = (m12 - m21) * s;
		} else if (m11 > m22) {
			s = Math.sqrt(1.0 + m11 - m00 - m22);
			y = 0.5 * s; // |y| >= 0.5
			s = 0.5 / s;
			x = (m10 + m01) * s;
			z = (m21 + m12) * s;
			w = (m20 - m02) * s;
		} else {
			s = Math.sqrt(1.0 + m22 - m00 - m11);
			z = 0.5 * s; // |z| >= 0.5
			s = 0.5 / s;
			x = (m20 + m02) * s;
			y = (m21 + m12) * s;
			w = (m01 - m10) * s;
		}

		this[0] = x;
		this[1] = y;
		this[2] = z;
		this[3] = w;
		return this;
	}

	setFromInvert(q) {
		const a0 = q[0],
			a1 = q[1],
			a2 = q[2],
			a3 = q[3],
			dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;

		// Would be faster to return [0,0,0,0] immediately if dot == 0
		if (dot == 0) { this[0] = this[1] = this[2] = this[3] = 0; return this; }

		const invDot = 1.0 / dot; // let invDot = dot ? 1.0/dot : 0;
		this[0] = -a0 * invDot;
		this[1] = -a1 * invDot;
		this[2] = -a2 * invDot;
		this[3] = a3 * invDot;
		return this;
	}

	// Axis must be normlized
	setFromAxisAngle(axis, angle) {
		const half = angle * .5,
			s = Math.sin(half);
		this[0] = axis[0] * s;
		this[1] = axis[1] * s;
		this[2] = axis[2] * s;
		this[3] = Math.cos(half);
		return this;
	}

	setFromUnitVectors(a, b) {
		// Using unit vectors, Shortest rotation from Direction A to Direction B
		// http://glmatrix.net/docs/quat.js.html#line548
		// http://physicsforgames.blogspot.com/2010/03/Quat-tricks.html
		const dot = Vec3.dot(a, b);

		if (dot < -0.999999) {
			const tmp = Vec3.cross(Vec3.LEFT, a);
			if (tmp.magnitude() < 0.000001) Vec3.cross(Vec3.UP, a, tmp);
			this.setFromAxisAngle(tmp.normalize(), Math.PI);
		} else if (dot > 0.999999) {
			this[0] = 0;
			this[1] = 0;
			this[2] = 0;
			this[3] = 1;
		} else {
			const v = Vec3.cross(a, b);
			this[0] = v[0];
			this[1] = v[1];
			this[2] = v[2];
			this[3] = 1 + dot;
			this.normalize();
		}
		return this;
	}

	normalize(out = null) {
		out = out || this;

		let length = this[0] ** 2 + this[1] ** 2 + this[2] ** 2 + this[3] ** 2;
		if (length > 0) {
			length = 1 / Math.sqrt(length);
			out[0] = this[0] * length;
			out[1] = this[1] * length;
			out[2] = this[2] * length;
			out[3] = this[3] * length;
		}
		return out;
	}

	invert(out = null) {
		const a0 = this[0],
			a1 = this[1],
			a2 = this[2],
			a3 = this[3],
			dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;

		// Would be faster to return [0,0,0,0] immediately if dot == 0
		if (dot == 0) { out[0] = out[1] = out[2] = out[3] = 0; }

		const invDot = 1.0 / dot; // let invDot = dot ? 1.0/dot : 0;
		out = out || this;
		out[0] = -a0 * invDot;
		out[1] = -a1 * invDot;
		out[2] = -a2 * invDot;
		out[3] = a3 * invDot;
		return out;
	}

	negate(out = null) {
		out = out || this;
		out[0] = -this[0];
		out[1] = -this[1];
		out[2] = -this[2];
		out[3] = -this[3];
		return out;
	}

	multiply(q) {
		const ax = this[0], ay = this[1], az = this[2], aw = this[3],
			bx = q[0], by = q[1], bz = q[2], bw = q[3];
		this[0] = ax * bw + aw * bx + ay * bz - az * by;
		this[1] = ay * bw + aw * by + az * bx - ax * bz;
		this[2] = az * bw + aw * bz + ax * by - ay * bx;
		this[3] = aw * bw - ax * bx - ay * by - az * bz;
		return this;
	}

	premultiply(q) {
		const ax = q[0], ay = q[1], az = q[2], aw = q[3],
			bx = this[0], by = this[1], bz = this[2], bw = this[3];
		this[0] = ax * bw + aw * bx + ay * bz - az * by;
		this[1] = ay * bw + aw * by + az * bx - ax * bz;
		this[2] = az * bw + aw * bz + ax * by - ay * bx;
		this[3] = aw * bw - ax * bx - ay * by - az * bz;
		return this;
	}

	//--------------------------------------
	// Extra functions to perform operations that I do quite often to save from creating a new quat object

	premultiplyAxisAngle(axis, angle) {
		const half = angle * .5,
			s = Math.sin(half),
			ax = axis[0] * s,	// A Quat based on Axis Angle
			ay = axis[1] * s,
			az = axis[2] * s,
			aw = Math.cos(half),

			bx = this[0],		// B of multiply
			by = this[1],
			bz = this[2],
			bw = this[3];

		// Quat.multiply( a, b );
		this[0] = ax * bw + aw * bx + ay * bz - az * by;
		this[1] = ay * bw + aw * by + az * bx - ax * bz;
		this[2] = az * bw + aw * bz + ax * by - ay * bx;
		this[3] = aw * bw - ax * bx - ay * by - az * bz;
		return this;
	}

	premultiplyInvert(q) {
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// q.invert()
		let ax = q[0],
			ay = q[1],
			az = q[2],
			aw = q[3];
		const dot = ax * ax + ay * ay + az * az + aw * aw;

		if (dot == 0) {
			ax = ay = az = aw = 0;
		} else {
			const dot_inv = 1.0 / dot;
			ax = -ax * dot_inv;
			ay = -ay * dot_inv;
			az = -az * dot_inv;
			aw = aw * dot_inv;
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Quat.multiply( a, b );
		const bx = this[0],
			by = this[1],
			bz = this[2],
			bw = this[3];
		this[0] = ax * bw + aw * bx + ay * bz - az * by;
		this[1] = ay * bw + aw * by + az * bx - ax * bz;
		this[2] = az * bw + aw * bz + ax * by - ay * bx;
		this[3] = aw * bw - ax * bx - ay * by - az * bz;
		return this;
	}

	static multiply(a, b, out?) {
		const ax = a[0], ay = a[1], az = a[2], aw = a[3],
			bx = b[0], by = b[1], bz = b[2], bw = b[3];

		out = out || new Quat();
		out[0] = ax * bw + aw * bx + ay * bz - az * by;
		out[1] = ay * bw + aw * by + az * bx - ax * bz;
		out[2] = az * bw + aw * bz + ax * by - ay * bx;
		out[3] = aw * bw - ax * bx - ay * by - az * bz;
		return out;
	}

	static dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]; }

	static invert(a, out = null) {
		//https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/quat.js
		out = out || new Quat();
		const a0 = a[0],
			a1 = a[1],
			a2 = a[2],
			a3 = a[3],
			dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;

		// Would be faster to return [0,0,0,0] immediately if dot == 0
		if (dot == 0) { out[0] = out[1] = out[2] = out[3] = 0; }

		const invDot = 1.0 / dot; // let invDot = dot ? 1.0/dot : 0;
		out[0] = -a0 * invDot;
		out[1] = -a1 * invDot;
		out[2] = -a2 * invDot;
		out[3] = a3 * invDot;
		return out;
	}

	static rotationFromUnitVectors(a, b) {
		// Using unit vectors, Shortest rotation from Direction A to Direction B
		// http://glmatrix.net/docs/quat.js.html#line548
		// http://physicsforgames.blogspot.com/2010/03/Quat-tricks.html
		const dot = Vec3.dot(a, b);
		const out = new Quat();

		if (dot < -0.999999) {
			const tmp = Vec3.cross(Vec3.LEFT, a);
			if (tmp.magnitude() < 0.000001) Vec3.cross(Vec3.UP, a, tmp);
			out.setFromAxisAngle(tmp.normalize(), Math.PI);
		} else if (dot > 0.999999) {
			out[0] = 0;
			out[1] = 0;
			out[2] = 0;
			out[3] = 1;
		} else {
			const v = Vec3.cross(a, b);
			out[0] = v[0];
			out[1] = v[1];
			out[2] = v[2];
			out[3] = 1 + dot;
			out.normalize();
		}
		return out;
	}
}

Quat.ZERO = new Quat();

export default Quat;