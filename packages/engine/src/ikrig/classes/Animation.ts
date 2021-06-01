class Animation {
	frame_cnt: number;
	time: number;
	times: any;
	tracks: any;
	constructor(anim = null) {
		this.frame_cnt = 0;
		this.time = 0;
		this.times = null;
		this.tracks = null;
		this.useStruct(anim);
	}

	// Gltf exports animation in the same format as the object, 
	// just copy its data to the object.
	useStruct(s) {
		this.frame_cnt = s.frame_cnt;
		this.time = s.time;
		this.times = s.times;
		this.tracks = s.tracks;
		return this;
	}
}

class AnimUtil {
	/*
	Animation data is saved in a flat array for simplicity & memory sake. 
	Because of that can not easily use Quaternion / Vector functions. So 
	recreate any functions needed to work with a flat data buffer.
	*/

	static QuatBufferCopy(buf, q, i) {
		q[0] = buf[i];
		q[1] = buf[i + 1];
		q[2] = buf[i + 2];
		q[3] = buf[i + 3];
		return q;
	}

	// Special Quaternion NLerp Function. Does DOT checking & Fix
	static QuatBufferBlend(buf, ai, bi, t, out) {
		const a_x = buf[ai],	// Quaternion From
			a_y = buf[ai + 1],
			a_z = buf[ai + 2],
			a_w = buf[ai + 3],
			b_x = buf[bi],	// Quaternion To
			b_y = buf[bi + 1],
			b_z = buf[bi + 2],
			b_w = buf[bi + 3],
			dot = a_x * b_x + a_y * b_y + a_z * b_z + a_w * b_w,
			ti = 1 - t
		let s = 1;

		// if Rotations with a dot less then 0 causes artifacts when lerping,
		// We can fix this by switching the sign of the To Quaternion.
		if (dot < 0) s = -1;
		out[0] = ti * a_x + t * b_x * s;
		out[1] = ti * a_y + t * b_y * s;
		out[2] = ti * a_z + t * b_z * s;
		out[3] = ti * a_w + t * b_w * s;
		return normalizeQuaternion(out);
	}

	//--------------------------------------------------

	static Vec3BufferCopy(buf, v, i) {
		v[0] = buf[i];
		v[1] = buf[i + 1];
		v[2] = buf[i + 2];
		return v;
	}

	// basic vec3 lerp
	static Vec3BufferLerp(buf, ai, bi, t, out) {
		const ti = 1 - t;
		out[0] = ti * buf[ai] + t * buf[bi];
		out[1] = ti * buf[ai + 1] + t * buf[bi + 1];
		out[2] = ti * buf[ai + 2] + t * buf[bi + 2];
		return out;
	}
}

function normalizeQuaternion(q) {
	let length = q[0] ** 2 + q[1] ** 2 + q[2] ** 2 + q[3] ** 2;
	if (length > 0) {
		length = 1 / Math.sqrt(length);
		q[0] *= length;
		q[1] *= length;
		q[2] *= length;
		q[3] *= length;
	}
	return q;
}

export default Animation;
export { AnimUtil };