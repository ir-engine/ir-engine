import Vec3 from "./Vec3";
import Quat from "./Quat";

// http://gabormakesgames.com/blog_transforms_transforms.html

class Transform{
	position: any;
	rotation: any;
	scale: any;
	constructor( t? ){
		this.rotation	= new Quat();
		this.position	= new Vec3();
		this.scale 	= new Vec3( 1, 1, 1 );

		if( arguments.length == 1 ){
			this.rotation.copy( t.rotation );
			this.position.copy( t.position );
			this.scale.copy( t.scale );
		}else if( arguments.length == 3 ){
			this.rotation.copy( arguments[ 0 ] );
			this.position.copy( arguments[ 1 ] );
			this.scale.copy( arguments[ 2 ] );
		}
	}

	//////////////////////////////////////////////////////////////////////
	// GETTER / SETTER
	//////////////////////////////////////////////////////////////////////
		copy( t ){
			this.rotation.copy( t.rotation );
			this.position.copy( t.position );
			this.scale.copy( t.scale );
			return this;
		}

		set( r=null, p=null, s=null ){
			if( r )	this.rotation.copy( r );
			if( p )	this.position.copy( p );
			if( s )	this.scale.copy( s );
			return this;
		}

		clone(){ return new Transform( this ); }

	//////////////////////////////////////////////////////////////////////
	// METHODS
	//////////////////////////////////////////////////////////////////////
		from_add( tp, tc ){
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// POSITION - parent.position + ( parent.rotation * ( parent.scale * child.position ) )
			const v = new Vec3().setFromMultiply( tp.scale, tc.position ); // parent.scale * child.position;
			v.transform_quat( tp.rotation ); //Vec3.transform_quat( v, tp.rotation, v );
			this.position.from_add( tp.position, v ); // Vec3.add( tp.position, v, this.position );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// SCALE - parent.scale * child.scale
			this.scale.setFromMultiply( tp.scale, tc.scale );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// ROTATION - parent.rotation * child.rotation
			this.rotation.setFromMultiply( tp.rotation, tc.rotation );
			//this.rotation.setFromMultiply( tc.rotation, tp.rotation );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			return this;
		}

		// Computing Transforms, Parent -> Child
		add( cr, cp?, cs = null ){
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// If just passing in Tranform Object
			if(arguments.length == 1){
				cr = arguments[0].rotation;
				cp = arguments[0].position;
				cs = arguments[0].scale;
			}

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// POSITION - parent.position + ( parent.rotation * ( parent.scale * child.position ) )
			this.position.add( Vec3.multiply( this.scale, cp ).transform_quat( this.rotation ) );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// SCALE - parent.scale * child.scale
			if( cs ) this.scale.multiply( cs );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// ROTATION - parent.rotation * child.rotation
			this.rotation.multiply( cr );

			return this;
		}

		// Computing Transforms in reverse, Child - > Parent
		add_rev( pr, pp, ps = null ){
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// If just passing in Tranform Object
			if(arguments.length == 1){
				pr = arguments[0].rotation;
				pp = arguments[0].position;
				ps = arguments[0].scale;
			}

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// POSITION - parent.position + ( parent.rotation * ( parent.scale * child.position ) )
			// The only difference for this func, We use the IN.scale & IN.rotation instead of THIS.scale * THIS.rotation
			// Consider that this Object is the child and the input is the Parent.
			this.position.multiply( ps ).transform_quat( pr ).add( pp );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// SCALE - parent.scale * child.scale
			if( ps ) this.scale.multiply( ps );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// ROTATION - parent.rotation * child.rotation
			this.rotation.premultiply( pr ); // Must Rotate from Parent->Child, need PMUL

			return this
		}

		add_pos( cp, ignore_scl = false ){
			//POSITION - parent.position + ( parent.rotation * ( parent.scale * child.position ) )
			if( ignore_scl )	this.position.add( Vec3.transform_quat( cp, this.rotation ) );
			else 				this.position.add( new Vec3( cp ).transform_quat( this.rotation ) );
			return this;
		}

		clear(){
			this.position.set( 0, 0, 0 );
			this.scale.set( 1, 1, 1 );
			this.rotation.reset();
			return this;
		}

		transform_vec( v, out = null ){
			//GLSL - vecQuatRotation(model.rotation, a_position.xyz * model.scale) + model.position;
			return (out || v)
				.setFromMultiply( v, this.scale )
				.transform_quat( this.rotation )
				.add( this.position );
		}

		dispose(){
			delete this.position;
			delete this.rotation;
			delete this.scale;
		}

	//////////////////////////////////////////////////////////////////////
	// STATIC FUNCTIONS
	//////////////////////////////////////////////////////////////////////
		static add( tp, tc, tOut ){
			tOut = tOut || new Transform();

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			//POSITION - parent.position + ( parent.rotation * ( parent.scale * child.position ) )
			
			//tOut.position.from_add( tp.position, Vec3.multiply( tp.scale, tc.position ).transform_quat( tp.rotation ) );
			tOut.position.from_add( tp.position, new Vec3( tc.position ).transform_quat( tp.rotation ) );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// SCALE - parent.scale * child.scale
			tOut.scale.setFromMultiply( tp.scale, tc.scale ); //Vec3.multiply( tp.scale, tc.scale, tOut.scale );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// ROTATION - parent.rotation * child.rotation
			tOut.rotation.setFromMultiply( tp.rotation, tc.rotation ); //Quat.multiply( tp.rotation, tc.rotation, tOut.rotation );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			return tOut;
		}

		static invert( t, inv ){
			inv = inv || new Transform();

			// Invert Rotation
			t.rotation.invert( inv.rotation );		

			// Invert Scale
			inv.scale.x = ( t.scale.x != 0 )? 1 / t.scale.x : 0;
			inv.scale.y = ( t.scale.y != 0 )? 1 / t.scale.y : 0;
			inv.scale.z = ( t.scale.z != 0 )? 1 / t.scale.z : 0;

			// Invert Position : rotInv * ( invScl * invPos )
			t.position.invert( inv.position ).multiply( inv.scale );
			Vec3.transform_quat( inv.position, inv.rotation, inv.position );

			return inv;
		}

		static fromPosition( x, y, z ){
			const t = new Transform();
			if( arguments.length == 3 )			t.position.set( x, y, z );
			else if( arguments.length == 1 )	t.position.copy( x );
			return t;
		}
}

export default Transform;

/*
	World Space Position to Local Space.
	
	V	.copy( gBWorld.eye_lid_upper_mid_l.position ) // World Space Postion
	 	.add( [0, -0.05 * t, 0 ] )	//Change it
		.sub( gBWorld.eye_l.position )	// Subtract from Parent's WS Position
		.div( gBWorld.eye_l.scale )	// Div by Parent's WS Scale
		.transform_quat( gBWorld.eye_l.rot_inv );	// Rotate by Parent's WS Inverse Rotation
*/