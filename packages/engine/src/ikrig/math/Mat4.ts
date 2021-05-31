class Matrix4 extends Float32Array{
	constructor(){ super(16); this[0] = this[5] = this[10] = this[15] = 1; }  //Setup Identity

		//reset data back to identity.
		reset(){ 
			for(let i=0; i <= this.magnitude; i++) this[i] = (i % 5 == 0)? 1 : 0; //only positions 0,5,10,15 need to be 1 else 0
			return this;
		}

		//copy another matrix's data to this one.
		copy( mat, offset=0 ){
			let i;
			for(i=0; i < 16; i++) this[i] = mat[ offset + i ];
			return this;
		}

		invert(){ Matrix4.invert( null, this ); return this; }

		setFromMultiply( a, b ){ 
			const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
				a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
				a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
				a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

			// Cache only the current line of the second matrix
			let b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
			this[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
			this[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
			this[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
			this[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

			b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
			this[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
			this[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
			this[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
			this[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

			b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
			this[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
			this[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
			this[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
			this[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

			b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
			this[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
			this[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
			this[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
			this[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
			return this;	
		}

		setFromInvert( mat ) {
			const a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3],
				a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7],
				a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11],
				a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15],

				b00 = a00 * a11 - a01 * a10,
				b01 = a00 * a12 - a02 * a10,
				b02 = a00 * a13 - a03 * a10,
				b03 = a01 * a12 - a02 * a11,
				b04 = a01 * a13 - a03 * a11,
				b05 = a02 * a13 - a03 * a12,
				b06 = a20 * a31 - a21 * a30,
				b07 = a20 * a32 - a22 * a30,
				b08 = a20 * a33 - a23 * a30,
				b09 = a21 * a32 - a22 * a31,
				b10 = a21 * a33 - a23 * a31,
				b11 = a22 * a33 - a23 * a32

				// Calculate the determinant
			let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

			if (!det) return false;
			det = 1.0 / det;

			this[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
			this[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
			this[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
			this[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
			this[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
			this[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
			this[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
			this[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
			this[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
			this[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
			this[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
			this[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
			this[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
			this[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
			this[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
			this[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

			return this;
		}

		getTranslation( out=null ){
			out = out || [0,0,0];
			out[0] = this[12];
			out[1] = this[13];
			out[2] = this[14];
			return out;
		}

		getScale( out=null ){
			out = out || [0,0,0];
			const m11 = this[0],
				m12 = this[1],
				m13 = this[2],
				m21 = this[4],
				m22 = this[5],
				m23 = this[6],
				m31 = this[8],
				m32 = this[9],
				m33 = this[10];
			out[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
			out[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
			out[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
			return out;
		}

		// Returns a quaternion representing the rotational component of a transformation matrix. If a matrix is built with
		// fromRotationTranslation, the returned quaternion will be the same as the quaternion originally supplied
		getRotation( out=null ){
			// Algorithm taken from http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
			const trace	= this[0] + this[5] + this[10]
			let S		= 0;

			out = out || [0,0,0,1];
			if(trace > 0){
				S = Math.sqrt(trace + 1.0) * 2;
				out[3] = 0.25 * S;
				out[0] = (this[6] - this[9]) / S;
				out[1] = (this[8] - this[2]) / S; 
				out[2] = (this[1] - this[4]) / S; 
			}else if( (this[0] > this[5]) && (this[0] > this[10]) ){ 
				S = Math.sqrt(1.0 + this[0] - this[5] - this[10]) * 2;
				out[3] = (this[6] - this[9]) / S;
				out[0] = 0.25 * S;
				out[1] = (this[1] + this[4]) / S; 
				out[2] = (this[8] + this[2]) / S; 
			}else if(this[5] > this[10]){ 
				S = Math.sqrt(1.0 + this[5] - this[0] - this[10]) * 2;
				out[3] = (this[8] - this[2]) / S;
				out[0] = (this[1] + this[4]) / S; 
				out[1] = 0.25 * S;
				out[2] = (this[6] + this[9]) / S; 
			}else{ 
				S = Math.sqrt(1.0 + this[10] - this[0] - this[5]) * 2;
				out[3] = (this[1] - this[4]) / S;
				out[0] = (this[8] + this[2]) / S;
				out[1] = (this[6] + this[9]) / S;
				out[2] = 0.25 * S;
			}
			return out;
		}

		multiply( b ){ 
			const a00 = this[0],	a01 = this[1],	a02 = this[2],	a03 = this[3],
				a10 = this[4],	a11 = this[5],	a12 = this[6],	a13 = this[7],
				a20 = this[8],	a21 = this[9],	a22 = this[10],	a23 = this[11],
				a30 = this[12],	a31 = this[13],	a32 = this[14],	a33 = this[15];

			// Cache only the current line of the second matrix
			let b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
			this[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
			this[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
			this[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
			this[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

			b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
			this[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
			this[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
			this[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
			this[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

			b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
			this[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
			this[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
			this[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
			this[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

			b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
			this[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
			this[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
			this[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
			this[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
			return this;	
		}

		static identity(out){
			for(let i=0; i <= out.length; i++) out[i] = (i % 5 == 0)? 1 : 0; //only positions 0,5,10,15 need to be 1 else 0
		}
		//From glMatrix
		//Multiple two mat4 together
		static multiply( a, b, out ){ 
			const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
				a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
				a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
				a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

			// Cache only the current line of the second matrix
			let b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
			out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
			out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
			out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
			out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

			b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
			out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
			out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
			out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
			out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

			b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
			out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
			out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
			out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
			out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

			b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
			out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
			out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
			out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
			out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
			return out;	
		}

		static scale(out,x,y,z){
			out[0] *= x;
			out[1] *= x;
			out[2] *= x;
			out[3] *= x;
			out[4] *= y;
			out[5] *= y;
			out[6] *= y;
			out[7] *= y;
			out[8] *= z;
			out[9] *= z;
			out[10] *= z;
			out[11] *= z;
			return out;
		}

		//make the rows into the columns
		static transpose( a, out ){
			//If we are transposing ourselves we can skip a few steps but have to cache some values
			if (out === a) {
				const a01 = a[1], a02 = a[2], a03 = a[3], a12 = a[6], a13 = a[7], a23 = a[11];
				out[1] = a[4];
				out[2] = a[8];
				out[3] = a[12];
				out[4] = a01;
				out[6] = a[9];
				out[7] = a[13];
				out[8] = a02;
				out[9] = a12;
				out[11] = a[14];
				out[12] = a03;
				out[13] = a13;
				out[14] = a23;
			}else{
				out[0] = a[0];
				out[1] = a[4];
				out[2] = a[8];
				out[3] = a[12];
				out[4] = a[1];
				out[5] = a[5];
				out[6] = a[9];
				out[7] = a[13];
				out[8] = a[2];
				out[9] = a[6];
				out[10] = a[10];
				out[11] = a[14];
				out[12] = a[3];
				out[13] = a[7];
				out[14] = a[11];
				out[15] = a[15];
			}

			return out;
		}

		static invert( mat, out ) {
			mat = mat || out; //If input isn't sent, then output is also input

			const a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3],
				a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7],
				a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11],
				a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15],

				b00 = a00 * a11 - a01 * a10,
				b01 = a00 * a12 - a02 * a10,
				b02 = a00 * a13 - a03 * a10,
				b03 = a01 * a12 - a02 * a11,
				b04 = a01 * a13 - a03 * a11,
				b05 = a02 * a13 - a03 * a12,
				b06 = a20 * a31 - a21 * a30,
				b07 = a20 * a32 - a22 * a30,
				b08 = a20 * a33 - a23 * a30,
				b09 = a21 * a32 - a22 * a31,
				b10 = a21 * a33 - a23 * a31,
				b11 = a22 * a33 - a23 * a32

				// Calculate the determinant
			let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

			if (!det) return false;
			det = 1.0 / det;

			out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
			out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
			out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
			out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
			out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
			out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
			out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
			out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
			out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
			out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
			out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
			out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
			out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
			out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
			out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
			out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

			return true;
		}

		//New function derived from fromRotationTranslation, just took out the translation stuff.
		static fromQuaternion( q, out ){
			// Quaternion math
			const x = q[0], y = q[1], z = q[2], w = q[3],
				x2 = x + x,
				y2 = y + y,
				z2 = z + z,

				xx = x * x2,
				xy = x * y2,
				xz = x * z2,
				yy = y * y2,
				yz = y * z2,
				zz = z * z2,
				wx = w * x2,
				wy = w * y2,
				wz = w * z2;

			out[0] = 1 - (yy + zz);
			out[1] = xy + wz;
			out[2] = xz - wy;
			out[3] = 0;
			out[4] = xy - wz;
			out[5] = 1 - (xx + zz);
			out[6] = yz + wx;
			out[7] = 0;
			out[8] = xz + wy;
			out[9] = yz - wx;
			out[10] = 1 - (xx + yy);
			out[11] = 0;
			return out;
		}

		static getTranslation(out, mat){
			out[0] = mat[12];
			out[1] = mat[13];
			out[2] = mat[14];
			return out;
		}

		//Returns a quaternion representing the rotational component of a transformation matrix. If a matrix is built with
		//fromRotationTranslation, the returned quaternion will be the same as the quaternion originally supplied
		static getRotation(out, mat){
			// Algorithm taken from http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
			const trace = mat[0] + mat[5] + mat[10]
			let S = 0;

			if(trace > 0){
				S = Math.sqrt(trace + 1.0) * 2;
				out[3] = 0.25 * S;
				out[0] = (mat[6] - mat[9]) / S;
				out[1] = (mat[8] - mat[2]) / S; 
				out[2] = (mat[1] - mat[4]) / S; 
			}else if( (mat[0] > mat[5]) && (mat[0] > mat[10]) ){ 
				S = Math.sqrt(1.0 + mat[0] - mat[5] - mat[10]) * 2;
				out[3] = (mat[6] - mat[9]) / S;
				out[0] = 0.25 * S;
				out[1] = (mat[1] + mat[4]) / S; 
				out[2] = (mat[8] + mat[2]) / S; 
			}else if(mat[5] > mat[10]){ 
				S = Math.sqrt(1.0 + mat[5] - mat[0] - mat[10]) * 2;
				out[3] = (mat[8] - mat[2]) / S;
				out[0] = (mat[1] + mat[4]) / S; 
				out[1] = 0.25 * S;
				out[2] = (mat[6] + mat[9]) / S; 
			}else{ 
				S = Math.sqrt(1.0 + mat[10] - mat[0] - mat[5]) * 2;
				out[3] = (mat[1] - mat[4]) / S;
				out[0] = (mat[8] + mat[2]) / S;
				out[1] = (mat[6] + mat[9]) / S;
				out[2] = 0.25 * S;
			}
			return out;
		}
}

export default Matrix4