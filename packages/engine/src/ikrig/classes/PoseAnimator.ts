import { AnimUtil } from "../classes/Animation";

class PoseAnimator {
	clock: number;
	rootIndex: any;
	root_x: number;
	rootZ: number;
	constructor() {
		this.clock = 0;
		this.rootIndex = null;
		this.root_x = 0;
		this.rootZ = 2;
	}
	tick(dt) { this.clock += dt; return this; }
	reset() { this.clock = 0; return this; }

	// Run animation and save results to pose object
	update(anim, pose) {
		const frameTimes = this._frameTimes(anim),
			q = [0, 0, 0, 0],
			v = [0, 0, 0]
		let track, ft;

		for (track of anim.tracks) {
			ft = frameTimes[track.time_idx];

			switch (track.type) {
				// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
				case "rotation":
					switch (track.interp) {
						case "STEP": AnimUtil.QuatBufferCopy(track.data, q, ft.a_idx * 4); break;
						default: AnimUtil.QuatBufferBlend(track.data, ft.a_idx * 4, ft.b_idx * 4, ft.time, q); break;
					}
					pose.setBone(track.joint_idx, q);
					break;

				// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
				case "position":
					switch (track.interp) {
						case "STEP": AnimUtil.Vec3BufferCopy(track.data, v, ft.a_idx * 3); break;
						default: AnimUtil.Vec3BufferLerp(track.data, ft.a_idx * 3, ft.b_idx * 3, ft.time, v); break;
					}

					if (this.rootIndex == track.joint_idx) {
						v[this.root_x] = 0;
						v[this.rootZ] = 0;
					}

					pose.setBone(track.joint_idx, null, v);
					break;
			}
		}

		return this;
	}

	// Every animation can have multiple shared time tracks.
	// So we incrmement our animation clock, then for each time
	// track we find between which two frames does the time exist.
	// Then we normalized the time between the two frames.
	// Return: [ { a_idx, b_idx, time }, ... ];
	_frameTimes(anim) {
		// Find the Frames for each group time.
		let j, i, time, fa, fb, ft;
		const rtn = new Array(anim.times.length),
			clock = this.clock % anim.time;

		for (j = 0; j < anim.times.length; j++) {
			time = anim.times[j];

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Find the first frame that is less then the clock.
			fa = 0;
			for (i = time.length - 2; i > 0; i--)
				if (time[i] < clock) { fa = i; break; }

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Normalize Time Between Frames
			fb = fa + 1;

			if (fb < time.length) ft = (clock - time[fa]) / (time[fb] - time[fa]);
			else { ft = 0; fb = null; }

			rtn[j] = { a_idx: fa, b_idx: fb, time: ft };
		}
		return rtn;
	}
}

export default PoseAnimator;