import { Quat, Vec3 }	from "../math/Maths";
import Transform		from "../math/Transform";

class Pose{
	static ROT: any;
	static POS: any;
	static SCL: any;
	armature: any;
	bones: any[];
	root_offset: any;
	constructor( armature ){
		this.armature			= armature;								// Reference Back to Armature, Make Apply work Easily
		this.bones			= new Array( armature.bones.length );	// Recreation of Bone Hierarchy
		this.root_offset	= new Transform();					// Parent Transform for Root Bone ( Skeletons from FBX imports need this to render right )

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Create Bone Transform Hierarchy to do transformations
		// without changing the actual armature.
		let b, pi;
		for( let i=0; i < armature.bones.length; i++ ){
			b = armature.bones[i];
			this.bones[ i ] = {
				chg_state	: 0,						// If Local Has Been Updated
				idx 		: b.idx,					// Bone Index in Armature
				p_idx 		: b.p_idx,					// Parent Bone Index in Armature
				len 		: b.len,					// Length of Bone
				name 		: b.name,
				local		: new Transform( b.local ), // Local Transform, use Bind pose as default
				world		: new Transform( b.world ),	// Model Space Transform
			};
		}
	}

	/////////////////////////////////////////////////////////////////
	// Setters / Getters
	/////////////////////////////////////////////////////////////////

		set_offset( rot=null, pos=null, scl=null ){ this.root_offset.set( rot, pos, scl ); return this; }
		
		set_bone( idx, rot=null, pos=null, scl=null ){
			const b = this.bones[ idx ];
			b.local.set( rot, pos, scl );

			// Set its Change State
			if( rot ) b.chg_state |= Pose.ROT;
			if( pos ) b.chg_state |= Pose.POS;
			if( scl ) b.chg_state |= Pose.SCL;
			return this;
		}

		set_state( idx, rot=false, pos=false, scl=false ){
			const b = this.bones[ idx ];
			if( rot ) b.chg_state |= Pose.ROT;
			if( pos ) b.chg_state |= Pose.POS;
			if( scl ) b.chg_state |= Pose.SCL;
			return this;
		}

		get_bone( bname ){ return this.bones[ this.armature.name_map[ bname ] ]; }

		get_local_rot( idx ){ return this.bones[ idx ].local.rot; }

		/*
		rot_local_by( bname, angle, axis="y" ){
			let b	= this.get_bone( bname );
			let rad	= angle * Math.PI / 180;

			switch( axis ){
				case "x" : b.local.rot.rot_x( rad ); break;
				case "y" : b.local.rot.rot_y( rad ); break;
				case "z" : b.local.rot.rot_z( rad ); break;
			}

			this.set_state( b.idx, true );
			return this;
		}
		*/

		rot_world_axis_angle( bname, axis, angle ){
			//Move bone to WS, do rot, then back to LS
			const b	= this.get_bone( bname ),
				qp	= this.get_parent_rot( b.idx ),
				qc	= Quat
					.mul( qp, b.local.rot )
					.pmul_axis_angle( axis, angle )
					.pmul_invert( qp );

			this.set_bone( b.idx, qc );						
			return this;
		}

	/////////////////////////////////////////////////////////////////
	// Methods
	/////////////////////////////////////////////////////////////////

		apply(){ this.armature.load_pose( this ); return this; }

		update_world(){
			for( const b of this.bones ){
				if( b.p_idx != null )	b.world.from_add( this.bones[ b.p_idx ].world, b.local ); // Parent.World + Child.Local
				else					b.world.from_add( this.root_offset, b.local );
			}
			return this;
		}

		get_parent_world( b_idx, pt=null, ct=null, t_offset=null ){
			const cbone = this.bones[ b_idx ];
			pt = pt || new Transform();

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

			// Child is a Root Bone, just reset since there is no parent.
			if( cbone.p_idx == null ){ 
				pt.clear();
			}else{
				// Parents Exist, loop till reaching the root
				let b = this.bones[ cbone.p_idx ];
				pt.copy( b.local );

				while( b.p_idx != null ){
					b = this.bones[ b.p_idx ];
					pt.add_rev( b.local );
				}
			}

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			
			pt.add_rev( this.root_offset );				// Add Starting Offset
			if( t_offset ) pt.add_rev( t_offset );		// Add Additional Starting Offset

			if( ct ) ct.from_add( pt, cbone.local );	// Requesting Child WS Info Too

			return pt;
		}

		get_parent_rot( b_idx, q=null ){
			const cbone = this.bones[ b_idx ];
			q = q || new Quat();

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Child is a Root Bone, just reset since there is no parent.
			if( cbone.p_idx == null ) q.reset();
			else{
				// Parents Exist, loop till reaching the root
				let b = this.bones[ cbone.p_idx ];
				q.copy( b.local.rot );

				while( b.p_idx != null ){
					b = this.bones[ b.p_idx ];
					q.pmul( b.local.rot );
				}
			}

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			q.pmul( this.root_offset.rot ); // Add Starting Offset
			return q;
		}

		/*
		get_parent_world_OLD( b_idx, pt, ct=null, t_offset=null ){
			let b	= this.bones[ b_idx ],
				ary	= [];

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Move up the Bone Tree
			while( b.p_idx != null ){
				ary.push( b.p_idx );
				b = this.bones[ b.p_idx ];
			}

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			let i 	= ary.length - 1,
				pb	= this.bones;

			// Figure out what the starting transform.
			if( !t_offset ) pt.copy( this.root_offset );
			else			pt.copy( t_offset ).add( this.root_offset );
			
			// Then add all the children bones
			for( i; i > -1; i-- ) pt.add( this.bones[ ary[i] ].local );	
			
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			if( ct ) ct.from_add( pt, this.bones[ b_idx ].local );	// Then add child current local transform to the parent's
		}
		*/

	/////////////////////////////////////////////////////////////////
	// Serialization
	/////////////////////////////////////////////////////////////////
	
		bare_serialize( inc_scl = false ){
			let b_len 	= this.bones.length,
				out		= new Array( b_len ),
				i, b, o;

			for( i=0; i < b_len; i++ ){
				b	= this.bones[ i ];
				o	= {
					rot : Array.from( b.local.rot ),	// Can not use TypeArrays with JSON.stringify
					pos : Array.from( b.local.pos )
				};

				if( inc_scl ) o.scl = Array.from( b.local.scl );
				out[ i ] = o;
			}
			return out;
		}

}

Pose.ROT = 1;
Pose.POS = 2;
Pose.SCL = 4;

export default Pose;