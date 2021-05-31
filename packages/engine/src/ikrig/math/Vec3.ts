class Vec3 extends Float32Array {
	static UP: any;
	static FORWARD: any;
	static DOWN: Vec3;
	static LEFT: Vec3;
	static RIGHT: Vec3;
	static BACK: Vec3;
	static ZERO: any;
	constructor(...ini: any[]) {
		super(3);

		if (ini instanceof Vec3 || (ini && ini.length == 3)) {
			this[0] = ini[0]; this[1] = ini[1]; this[2] = ini[2];
		} else if (ini.length == 3) {
			this[0] = ini[0]; this[1] = ini[1]; this[2] = ini[2];
		} else {
			ini[0] = ini[1] = ini[2] = ini || 0;
		}
	}

	get x() { return this[0]; } set x(v) { this[0] = v; }
	get y() { return this[1]; } set y(v) { this[1] = v; }
	get z() { return this[2]; } set z(v) { this[2] = v; }

	set(x = null, y = null, z = null) {
		if (x != null) this[0] = x;
		if (y != null) this[1] = y;
		if (z != null) this[2] = z;
		return this;
	}

	fromStruct(o) { this[0] = o.x; this[1] = o.y; this[2] = o.z; return this; }

	copy(v) { this[0] = v[0]; this[1] = v[1]; this[2] = v[2]; return this; }

	clone() { return new Vec3(this); }

	//-------------------------------------------

	fromBuf(array, i) { this[0] = array[i]; this[1] = array[i + 1]; this[2] = array[i + 2]; return this; }
	toBuf(array, i) { array[i] = this[0]; array[i + 1] = this[1]; array[i + 2] = this[2]; return this; }

	//-------------------------------------------

	magnitude(v) {
		//Only get the magnitude of this vector
		if (!v) return Math.sqrt(this[0] ** 2 + this[1] ** 2 + this[2] ** 2);

		//Get magnitude based on another vector
		const x = this[0] - v[0],
			y = this[1] - v[1],
			z = this[2] - v[2];

		return Math.sqrt(x * x + y * y + z * z);
	}

	magnitudeSquared(v?) {
		//Only get the squared magnitude of this vector
		if (v === undefined) return this[0] ** 2 + this[1] ** 2 + this[2] ** 2;

		//Get squared magnitude based on another vector
		const x = this[0] - v[0],
			y = this[1] - v[1],
			z = this[2] - v[2];

		return x * x + y * y + z * z;
	}

	setFromAdd(a, b) {
		this[0] = a[0] + b[0];
		this[1] = a[1] + b[1];
		this[2] = a[2] + b[2];
		return this;
	}

	setFromSubtract(a, b) {
		this[0] = a[0] - b[0];
		this[1] = a[1] - b[1];
		this[2] = a[2] - b[2];
		return this;
	}

	setFromMultiply(a, b) {
		this[0] = a[0] * b[0];
		this[1] = a[1] * b[1];
		this[2] = a[2] * b[2];
		return this;
	}

	from_div(a, b) {
		this[0] = (b[0] != 0) ? a[0] / b[0] : 0;
		this[1] = (b[1] != 0) ? a[1] / b[1] : 0;
		this[2] = (b[2] != 0) ? a[2] / b[2] : 0;
		return this;
	}

	setFromScale(a, s) {
		this[0] = a[0] * s;
		this[1] = a[1] * s;
		this[2] = a[2] * s;
		return this;
	}

	//-------------------------------------------

	setFromNormalize(v) {
		let mag = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
		if (mag == 0) return this;

		mag = 1 / mag;
		this[0] = v[0] * mag;
		this[1] = v[1] * mag;
		this[2] = v[2] * mag;
		return this;
	}

	setFromInvert(a) {
		this[0] = -a[0];
		this[1] = -a[1];
		this[2] = -a[2];
		return this;
	}

	setFromCross(a, b) {
		const ax = a[0], ay = a[1], az = a[2],
			bx = b[0], by = b[1], bz = b[2];
		this[0] = ay * bz - az * by;
		this[1] = az * bx - ax * bz;
		this[2] = ax * by - ay * bx;
		return this;
	}

	setFromLerp(a, b, t) {
		const ti = 1 - t; // Linear Interpolation : (1 - t) * v0 + t * v1;
		this[0] = a[0] * ti + b[0] * t;
		this[1] = a[1] * ti + b[1] * t;
		this[2] = a[2] * ti + b[2] * t;
		return this;
	}

	fromQuaternion(q, v = Vec3.FORWARD) {
		//Vec3.transformQuat( dir || Vec3.FORWARD, q, this );
		const qx = q[0], qy = q[1], qz = q[2], qw = q[3],
			vx = v[0], vy = v[1], vz = v[2],
			x1 = qy * vz - qz * vy,
			y1 = qz * vx - qx * vz,
			z1 = qx * vy - qy * vx,
			x2 = qw * x1 + qy * z1 - qz * y1,
			y2 = qw * y1 + qz * x1 - qx * z1,
			z2 = qw * z1 + qx * y1 - qy * x1;

		this[0] = vx + 2 * x2;
		this[1] = vy + 2 * y2;
		this[2] = vz + 2 * z2;
		return this;
	}

	add(v, out = null) {
		out = out || this;
		out[0] = this[0] + v[0];
		out[1] = this[1] + v[1];
		out[2] = this[2] + v[2];
		return out;
	}

	subtract(v, out = null) {
		out = out || this;
		out[0] = this[0] - v[0];
		out[1] = this[1] - v[1];
		out[2] = this[2] - v[2];
		return out;
	}

	multiply(v, out = null) {
		out = out || this;
		out[0] = this[0] * v[0];
		out[1] = this[1] * v[1];
		out[2] = this[2] * v[2];
		return out;
	}

	div(v, out = null) {
		out = out || this;
		out[0] = (v[0] != 0) ? this[0] / v[0] : 0;
		out[1] = (v[1] != 0) ? this[1] / v[1] : 0;
		out[2] = (v[2] != 0) ? this[2] / v[2] : 0;
		return out;
	}

	scale(v, out = null) {
		out = out || this;
		out[0] = this[0] * v;
		out[1] = this[1] * v;
		out[2] = this[2] * v;
		return out;
	}

	//-------------------------------------------

	abs(out = null) {
		out = out || this;
		out[0] = Math.abs(this[0]);
		out[1] = Math.abs(this[1]);
		out[2] = Math.abs(this[2]);
		return out;
	}

	floor(out = null) {
		out = out || this;
		out[0] = Math.floor(this[0]);
		out[1] = Math.floor(this[1]);
		out[2] = Math.floor(this[2]);
		return out;
	}

	invert(out = null) {
		out = out || this;
		out[0] = -this[0];
		out[1] = -this[1];
		out[2] = -this[2];
		return out;
	}

	normalize(out = null) {
		let mag = Math.sqrt(this[0] ** 2 + this[1] ** 2 + this[2] ** 2);
		if (mag == 0) return this;

		mag = 1 / mag;
		out = out || this;
		out[0] = this[0] * mag;
		out[1] = this[1] * mag;
		out[2] = this[2] * mag;

		return out;
	}

	rotate(rad, axis = "x", out = null) {
		//https://www.siggraph.org/education/materials/HyperGraph/modeling/mod_tran/3drota.htm
		out = out || this;

		const sin = Math.sin(rad),
			cos = Math.cos(rad),
			x = this[0],
			y = this[1],
			z = this[2];

		switch (axis) {
			case "y": //..........................
				out[0] = z * sin + x * cos; //x
				out[2] = z * cos - x * sin; //z
				break;
			case "x": //..........................
				out[1] = y * cos - z * sin; //y
				out[2] = y * sin + z * cos; //z
				break;
			case "z": //..........................
				out[0] = x * cos - y * sin; //x
				out[1] = x * sin + y * cos; //y
				break;
		}

		return out;
	}

	lerp(v, t, out) {
		if (out == null) out = this;
		const ti = 1 - t;

		//Linear Interpolation : (1 - t) * v0 + t * v1;
		out[0] = this[0] * ti + v[0] * t;
		out[1] = this[1] * ti + v[1] * t;
		out[2] = this[2] * ti + v[2] * t;
		return out;
	}

	transformQuat(q) {
		const qx = q[0], qy = q[1], qz = q[2], qw = q[3],
			vx = this[0], vy = this[1], vz = this[2],
			x1 = qy * vz - qz * vy,
			y1 = qz * vx - qx * vz,
			z1 = qx * vy - qy * vx,
			x2 = qw * x1 + qy * z1 - qz * y1,
			y2 = qw * y1 + qz * x1 - qx * z1,
			z2 = qw * z1 + qx * y1 - qy * x1;

		this[0] = vx + 2 * x2;
		this[1] = vy + 2 * y2;
		this[2] = vz + 2 * z2;
		return this;
	}

	static add(a, b, out = null) {
		out = out || new Vec3();
		out[0] = a[0] + b[0];
		out[1] = a[1] + b[1];
		out[2] = a[2] + b[2];
		return out;
	}

	static subtract(a, b, out = null) {
		out = out || new Vec3();
		out[0] = a[0] - b[0];
		out[1] = a[1] - b[1];
		out[2] = a[2] - b[2];
		return out;
	}

	static multiply(a, b, out = null) {
		out = out || new Vec3();
		out[0] = a[0] * b[0];
		out[1] = a[1] * b[1];
		out[2] = a[2] * b[2];
		return out;
	}

	static div(v, s, out = null) {
		out = out || new Vec3();
		out[0] = v[0] / s;
		out[1] = v[1] / s;
		out[2] = v[2] / s;
		return out;
	}

	static scale(v, s, out = null) {
		out = out || new Vec3();
		out[0] = v[0] * s;
		out[1] = v[1] * s;
		out[2] = v[2] * s;
		return out;
	}

	//-------------------------------------------

	static normalize(v) { return new Vec3().setFromNormalize(v); }

	static dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }

	static cross(a, b, out?) {
		const ax = a[0], ay = a[1], az = a[2],
			bx = b[0], by = b[1], bz = b[2];

		out = out || new Vec3();
		out[0] = ay * bz - az * by;
		out[1] = az * bx - ax * bz;
		out[2] = ax * by - ay * bx;
		return out;
	}

	static angle(v0, v1) {
		//acos(dot(a,b)/(length(a)*length(b))) 
		//let theta = this.dot( v0, v1 ) / ( Math.sqrt( v0.magnitudeSquared() * v1.magnitudeSquared() ) );
		//return Math.acos( Math.max( -1, Math.min( 1, theta ) ) ); // clamp ( t, -1, 1 )

		// atan2(length(cross(a,b)),dot(a,b))  
		const d = this.dot(v0, v1),
			c = this.cross(v0, v1);
		return Math.atan2(c.magnitude(), d);

		//let cosine = this.dot( v0, v1 );
		//if(cosine > 1.0) return 0;
		//else if(cosine < -1.0) return Math.PI;
		//else return Math.acos( cosine / ( Math.sqrt( v0.magnitudeSquared() * v1.magnitudeSquared() ) ) );
	}

	//-------------------------------------------

	static magnitude(a, b) { return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2); }
	static magnitudeSquared(a, b) { return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2; }

	//-------------------------------------------

	static transformQuat(v, q, out = null) {
		out = out || new Vec3();
		const qx = q[0], qy = q[1], qz = q[2], qw = q[3],
			vx = v[0], vy = v[1], vz = v[2],
			x1 = qy * vz - qz * vy,
			y1 = qz * vx - qx * vz,
			z1 = qx * vy - qy * vx,
			x2 = qw * x1 + qy * z1 - qz * y1,
			y2 = qw * y1 + qz * x1 - qx * z1,
			z2 = qw * z1 + qx * y1 - qy * x1;

		out[0] = vx + 2 * x2;
		out[1] = vy + 2 * y2;
		out[2] = vz + 2 * z2;
		return out;
	}

	static lerp(a, b, t, out = null) {
		out = out || new Vec3();

		const ti = 1 - t; // Linear Interpolation : (1 - t) * v0 + t * v1;
		out[0] = a[0] * ti + b[0] * t;
		out[1] = a[1] * ti + b[1] * t;
		out[2] = a[2] * ti + b[2] * t;
		return out;
	}

	// B & C are the main points, A & D are the tangents
	static cubic_spline(a, b, c, d, t, out) {
		const t2 = t * t,
			t3 = t * t2,
			a0 = d[0] - c[0] - a[0] + b[0],
			a1 = d[1] - c[1] - a[1] + b[1],
			a2 = d[2] - c[2] - a[2] + b[2];
		out[0] = a0 * t3 + (a[0] - b[0] - a0) * t2 + (c[0] - a[0]) * t + b[0];
		out[1] = a1 * t3 + (a[1] - b[1] - a1) * t2 + (c[1] - a[1]) * t + b[1];
		out[2] = a2 * t3 + (a[2] - b[2] - a2) * t2 + (c[2] - a[2]) * t + b[2];
		return out;
	}
}

// CONSTANTS
Vec3.UP = new Vec3(0, 1, 0);
Vec3.DOWN = new Vec3(0, -1, 0);
Vec3.LEFT = new Vec3(1, 0, 0);
Vec3.RIGHT = new Vec3(-1, 0, 0);
Vec3.FORWARD = new Vec3(0, 0, 1);
Vec3.BACK = new Vec3(0, 0, -1);
Vec3.ZERO = new Vec3(0, 0, 0);

export default Vec3;