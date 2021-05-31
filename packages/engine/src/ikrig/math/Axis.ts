import Vec3 from "./Vec3";
import Quat from "./Quat";

/*
3x3 Rotation Matrix
R  T  F      
00 03 06
01 04 07
02 05 08

left	(0,1,2)
up		(3,4,5)
forward	(6,7,9)
*/
class Axis{
	x: Vec3;
	y: Vec3;
	z: Vec3;
	constructor(){
		this.x = new Vec3( Vec3.LEFT );
		this.y = new Vec3( Vec3.UP );
		this.z = new Vec3( Vec3.FORWARD );
	}
		//Passing in Vectors.
		set( x, y, z, do_norm = false ){
			this.x.copy( x );
			this.y.copy( y );
			this.z.copy( z );

			if(do_norm){
				this.x.normalize();
				this.y.normalize();
				this.z.normalize();
			}
			return this;
		}

		fromQuaternion( q ){
			// Same code for Quat to Matrix 3 conversion
			const x = q[0], y = q[1], z = q[2], w = q[3],
				x2 = x + x,
				y2 = y + y,
				z2 = z + z,
				xx = x * x2,
				yx = y * x2,
				yy = y * y2,
				zx = z * x2,
				zy = z * y2,
				zz = z * z2,
				wx = w * x2,
				wy = w * y2,
				wz = w * z2;

			this.x.set( 1 - yy - zz,	yx + wz,		zx - wy );
			this.y.set( yx - wz,		1 - xx - zz,	zy + wx );
			this.z.set( zx + wy,		zy - wx,		1 - xx - yy );
			return this;
		}

		fromDirection( fwd, up ){
			this.z.copy( fwd ).normalize();
			this.x.setFromCross( up, this.z ).normalize();
			this.y.setFromCross( this.z, this.x ).normalize();			
			return this;
		}

		rotate( rad, axis = "x", out = null ){
			out = out || this;

			const sin = Math.sin(rad),
				cos = Math.cos(rad)
			let x, y, z;

			switch(axis){
				case "y": //..........................
					x = this.x[0];	z = this.x[2];
					this.x[0]	= z*sin + x*cos; //x
					this.x[2]	= z*cos - x*sin; //z

					x = this.z[0];	z = this.z[2];
					this.z[0]	= z*sin + x*cos; //x
					this.z[2]	= z*cos - x*sin; //z
				break;
				case "x": //..........................
					y = this.y[1];	z = this.y[2];
					this.y[1]	= y*cos - z*sin; //y
					this.y[2]	= y*sin + z*cos; //z

					y = this.z[1];	z = this.z[2];
					this.z[1]	= y*cos - z*sin; //y
					this.z[2]	= y*sin + z*cos; //z
				break;
				case "z": //..........................
					x = this.x[0];	y = this.x[1];
					this.x[0]	= x*cos - y*sin; //x
					this.x[1]	= x*sin + y*cos; //y

					x = this.y[0];	y = this.y[1];
					this.y[0]	= x*cos - y*sin; //x
					this.y[1]	= x*sin + y*cos; //y
				break;
			}

			return out;
		}
}

export default Axis;