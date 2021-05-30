import Maths, { Quat, Vec3 }	from "../math/Maths";
import Transform				from "../math/Transform";
import Axis						from "../math/Axis";
import { Component } from "../../ecs/classes/Component";

class IKTarget extends Component<IKTarget>{
	start_pos: Vec3 = new Vec3();
	end_pos: Vec3 = new Vec3();
	axis: Axis = new Axis();
	len_sqr = 0;
	len = 0;
	
	/////////////////////////////////////////////////////////////////////
	// GETTERS - SETTERS
	/////////////////////////////////////////////////////////////////////	
		
		/** Define the target based on a Start and End Position along with
			Up direction or the direction of the bend. */
		from_pos( pA, pB, up_dir ){
			this.start_pos.copy( pA );
			this.end_pos.copy( pB );

			this.len_sqr	= this.axis.z.from_sub( pB, pA ).len_sqr();
			this.len		= Math.sqrt( this.len_sqr );

			this.axis.from_dir( this.axis.z, up_dir );
			return this;
		}

		from_pos_dir( position, dir, up_dir, len_scl ){
			this.start_pos.copy( position );
			this.end_pos
				.from_scale( dir, len_scl )	// Compute End Effector
				.add( position );

			this.len_sqr	= Vec3.len_sqr( position, this.end_pos );
			this.len		= Math.sqrt( this.len_sqr );

			this.axis.from_dir( dir, up_dir ); // Target Axis
			return this;
		}

	/////////////////////////////////////////////////////////////////////
	// 
	/////////////////////////////////////////////////////////////////////
		
		/** Visually see the Target information */
		debug( d, scale=1.0 ){ 
			const v = new Vec3(),
				p = this.start_pos,
				a = this.axis;
			d	.setLine( p, v.from_scale( a.z , scale ).add( p ), "green" )
				.setLine( p, v.from_scale( a.x , scale ).add( p ), "red" )
				.setLine( p, v.from_scale( a.y , scale ).add( p ), "blue" )
				.setPoint( p, "green", 0.05, 1 )
				.setPoint( this.end_pos, "red", 0.05, 1 );
			return this;
		}

	///////////////////////////////////////////////////////////////////
	// Single Bone Solvers
	///////////////////////////////////////////////////////////////////
		
		_aim_bonexxx( chain, pose, p_wt, out ){
			/*
			The idea is to Aim the root bone in the direction of the target. Originally used a lookAt rotation 
			then correcting it to take in account the bone's points up, not forward.

			Instead, Build a rotation based on axis direction. Start by using target's fwd dir as the bone's up dir.
			To Help keep orientation, use the bone's Bind( or TPose ) world space fwd as a starting point to help get
			the left dir. With UP and Left, do another cross product for fwd to keep the axis orthogonal.

			This aims the limb pretty well at the target. The final step is to twist the limb so its joint (elbow, knee)
			is pointing at the UP dir of the target axis. This helps define how much twisting we need to apply to the bone.
			Arm and Knees tend to have different natural pose. The leg's fwd is fwd but the arm's fwd may be point down or back,
			all depends on how the rigging was setup.

			Since he bone is now aligned to the target, it shares the same Direction axis that we can then easily apply a twist
			rotation. The target's UP is final dir, so we take the lumb's aligning axis's world space dire and simply use 
			Quat.rotateTo( v1, v2 ). This function creates a rotation needed to get from One Vector dir to the other.
			*/
			
			const rotation		= Quat.mul( p_wt.rotation, pose.getLocalRotation( chain.bones[0].idx ) ),	// Get World Space Rotation for Bone
				f_dir	= Vec3.transform_quat( Vec3.FORWARD, rotation ),					// Get Bone's WS Forward Dir
				l_dir	= Vec3.cross( this.axis.z, f_dir ).norm();					// WS Left Dir

			f_dir.from_cross( l_dir, this.axis.z ).norm();							// Realign forward to keep axis orthogonal for proper rotation

			out.from_axis( l_dir, this.axis.z, f_dir );								// Final World Space Rotation
			if( Quat.dot( out, rotation ) < 0 ) out.negate();							// If axis is point in the opposite direction of the bind rotation, flip the signs : Thx @gszauer

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Need to apply a twist rotation to aim the bending joint 
			// (elbow,knee) in the direction of the IK Target UP Axis.

			let align_dir;
			switch( chain.align_axis ){ // Arm/Legs have different Axis to align to Twisting.
				case "x": align_dir = l_dir; break;
				case "z": align_dir = f_dir; break;
			}
			
			//console.log("epp", Vec3.dot( align_dir, this.axis.y ) );
			//####################################################
			const b = pose.bones[ chain.first() ];
			const t = new Transform();
			t.from_add( p_wt, b.local );
			//console.log(  chain.align_axis  );
			//App.Debug.setLine( t.position, Vec3.add( t.position, align_dir ), "orange" );
			//App.Debug.setLine( t.position, Vec3.add( t.position, this.axis.y ), "white" );
			//####################################################

			// Shortest Twisting Direction
			const vdot = Vec3.dot( align_dir, this.axis.y );
			if( vdot < 0 ) align_dir.invert();
			

			// Create and apply twist rotation.
			rotation.from_unit_vecs( align_dir, this.axis.y );
			out.pmul( rotation );


			return out;
		}

		aimxxx( chain, tpose, pose, p_wt ){
			const rotation = new Quat();
			this._aim_bone( chain, tpose, p_wt, rotation );
			rotation.pmul_invert( p_wt.rotation ); // Convert to Bone's Local Space by mul invert of parent bone rotation
			pose.setBone( chain.bones[ 0 ].idx, rotation );
		}
	_aim_bone(chain: any, tpose: any, p_wt: any, rotation: Quat) {
		throw new Error("Method not implemented.");
	}

		aim2( chain, tpose, pose, p_wt ){
			const rotation = new Quat();
			this._aim_bone2( chain, tpose, p_wt, rotation );

			rotation.pmul_invert( p_wt.rotation ); // Convert to Bone's Local Space by mul invert of parent bone rotation
			pose.setBone( chain.bones[ 0 ].idx, rotation );
		}

		_aim_bone2( chain, tpose, p_wt, out ){
			const rotation	= Quat.mul( p_wt.rotation, tpose.getLocalRotation( chain.first() ) ),	// Get World Space Rotation for Bone
				dir	= Vec3.transform_quat( chain.alt_fwd, rotation );					// Get Bone's WS Forward Dir

			//let ct = new Transform();
			//let b = tpose.bones[ chain.first() ];
			//ct.from_add( p_wt, b.local );
			//App.Debug.setPoint( ct.position, "white", 0.03 );
			//App.Debug.setLine( ct.position, Vec3.add( ct.position, f_dir), "orange" );

			//Swing
			const q = Quat.unit_vecs( dir, this.axis.z );
			out.from_mul( q, rotation );

			// Twist 
			//let u_dir	= Vec3.transform_quat( chain.alt_up, out );
			//let twist 	= Vec3.angle( u_dir, this.axis.y );
			//App.Debug.setLine( ct.position, Vec3.add( ct.position, u_dir), "white" );

			dir.from_quat( out, chain.alt_up );				// After Swing, Whats the UP Direction
			let twist 	= Vec3.angle( dir, this.axis.y );	// Get difference between Swing Up and Target Up

			if( twist <= 0.00017453292 ) twist = 0;
			else{
				//let l_dir  	= Vec3.cross( dir, this.axis.z );
				dir.from_cross( dir, this.axis.z );	// Get Swing LEFT, used to test if twist is on the negative side.
				//App.Debug.setLine( ct.position, Vec3.add( ct.position, l_dir), "black" );

				if( Vec3.dot( dir, this.axis.y ) >= 0 ) twist = -twist; 
			}
	
			out.pmul_axis_angle( this.axis.z, twist );	// Apply Twist

			//if( Quat.dot( out, rotation ) < 0 ) out.negate();	

			//console.log( Quat.dot( rotation, out ) );
		
/*

	q.from_unit_vecs( Vec3.FORWARD, p_fwd )			// Rotation Difference From True FWD and Pose FWD, Swing Rotation
		.mul( tb.world.rotation );						// Apply Swing to TPose WS Rotation, gives Swing in WS

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	let s_up	= Vec3.transform_quat( t_up, q ),	// Get UP Direction of the Swing Rotation
		twist	= Vec3.angle( s_up, p_up );			// Swing+Pose have same Fwd, Use Angle between both UPs for twist

	if( twist <= (0.01 * Math.PI / 180) ){
		twist = 0; // If Less the .01 Degree, dont bother twisting.
	}else{
		// Swing FWD and Pose FWD Should be the same in ws, So no need to calc it,
		// So using Pose Fwd and Swing up to get Swing left
		// Is the Angle going to be Negative?, use Swing Left to determine if 
		// its in the left or right side of UP
		let s_lft = Vec3.cross( s_up, p_fwd ).norm();
		if( Vec3.dot( s_lft, p_up ) >= 0 )	twist = -twist; 
	}

*/
			
		}

	///////////////////////////////////////////////////////////////////
	// Multi Bone Solvers
	///////////////////////////////////////////////////////////////////
		
		limb( chain, tpose, pose, p_wt ){
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Using law of cos SSS, so need the length of all sides of the triangle
			let bind_a 	= tpose.bones[ chain.bones[0].idx ],	// Bone Reference from Bind
				bind_b	= tpose.bones[ chain.bones[1].idx ],
				pose_a 	= pose.bones[ chain.bones[0].idx ],		// Bone Reference from Pose
				pose_b	= pose.bones[ chain.bones[1].idx ],
				aLen	= bind_a.len,
				bLen	= bind_b.len,
				cLen	= this.len,
				rotation 	= new Quat(),	
				rad;

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// FIRST BONE - Aim then rotate by the angle.
			this._aim_bone2( chain, tpose, p_wt, rotation );				// Aim the first bone toward the target oriented with the bend direction.

			rad	= Maths.lawcos_sss( aLen, cLen, bLen );				// Get the Angle between First Bone and Target.
			
			rotation	.pmul_axis_angle( this.axis.x, -rad )				// Use the Target's X axis for rotation along with the angle from SSS
				.pmul_invert( p_wt.rotation );							// Convert to Bone's Local Space by mul invert of parent bone rotation

			pose.setBone( bind_a.idx, rotation );						// Save result to bone.
			pose_a.world											// Update World Data for future use
				.copy( p_wt )
				.add( rotation, bind_a.local.position, bind_a.local.scale );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// SECOND BONE
			// Need to rotate from Right to Left, So take the angle and subtract it from 180 to rotate from 
			// the other direction. Ex. L->R 70 degrees == R->L 110 degrees
			rad	= Math.PI - Maths.lawcos_sss( aLen, bLen, cLen );
			
			rotation .from_mul( pose_a.world.rotation, bind_b.local.rotation )		// Add Bone 2's Local Bind Rotation to Bone 1's new World Rotation.
				.pmul_axis_angle( this.axis.x, rad )				// Rotate it by the target's x-axis
				.pmul_invert( pose_a.world.rotation );					// Convert to Bone's Local Space

			pose.setBone( bind_b.idx, rotation );						// Save result to bone.
			pose_b.world											// Update World Data for future use
				.copy( pose_a.world )
				.add( rotation, bind_b.local.position, bind_b.local.scale );
		}

		three_bone( chain, tpose, pose, p_wt ){
			//------------------------------------
			// Get the length of the bones, the calculate the ratio length for the bones based on the chain length
			// The 3 bones when placed in a zig-zag pattern creates a Parallelogram shape. We can break the shape down into two triangles
			// By using the ratio of the Target length divided between the 2 triangles, then using the first bone + half of the second bound
			// to solve for the top 2 joiints, then uing the half of the second bone + 3rd bone to solve for the bottom joint.
			// If all bones are equal length,  then we only need to use half of the target length and only test one triangle and use that for
			// both triangles, but if bones are uneven, then we need to solve an angle for each triangle which this function does.	

			//------------------------------------
			let bind_a 	= tpose.bones[ chain.bones[0].idx ],	// Bone Reference from Bind
				bind_b	= tpose.bones[ chain.bones[1].idx ],
				bind_c	= tpose.bones[ chain.bones[2].idx ],

				pose_a 	= pose.bones[ chain.bones[0].idx ],			// Bone Reference from Pose
				pose_b	= pose.bones[ chain.bones[1].idx ],
				pose_c	= pose.bones[ chain.bones[2].idx ],				

				a_len	= bind_a.len,				// First Bone length
				b_len 	= bind_b.len,				// Second Bone Length
				c_len	= bind_c.len,				// Third Bone Length
				bh_len 	= bind_b.len * 0.5,			// How Much of Bone 2 to use with Bone 1

				t_ratio	= ( a_len + bh_len ) / ( a_len + b_len + c_len ),	// How much to subdivide the Target length between the two triangles
				ta_len = this.len * t_ratio,								// Goes with A & B
				tb_len = this.len - ta_len,									// Goes with B & C

				rotation 	= new Quat(),
				rad;
				
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Bone A 
			this._aim_bone2( chain, tpose, p_wt, rotation );		// Aim the first bone toward the target oriented with the bend direction.

			rad	= Maths.lawcos_sss( a_len, ta_len, bh_len );	// Get the Angle between First Bone and Target.
			rotation
				.pmul_axis_angle( this.axis.x, -rad )			// Rotate the the aimed bone by the angle from SSS
				.pmul_invert( p_wt.rotation );							// Convert to Bone's Local Space by mul invert of parent bone rotation

			pose.setBone( bind_a.idx, rotation );

			pose_a.world
				.copy( p_wt )
				.add( rotation, bind_a.local.position, bind_a.local.scale );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Bone B
			rad = Math.PI - Maths.lawcos_sss( a_len, bh_len, ta_len );

			rotation .from_mul( pose_a.world.rotation, bind_b.local.rotation )	// Add Bone Local to get its WS rotation
				.pmul_axis_angle( this.axis.x, rad )			// Rotate it by the target's x-axis .pmul( tmp.from_axis_angle( this.axis.x, rad ) )
				.pmul_invert( pose_a.world.rotation );				// Convert to Local Space in temp to save WS rotation for next bone.

			pose.setBone( bind_b.idx, rotation );

			pose_b.world
				.copy( pose_a.world )
				.add( rotation, bind_b.local.position, bind_b.local.scale );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Bone C
			rad = Math.PI - Maths.lawcos_sss( c_len, bh_len, tb_len );
			rotation	.from_mul( pose_b.world.rotation, bind_c.local.rotation  )	// Still contains WS from previous bone, Add next bone's local
				.pmul_axis_angle( this.axis.x, -rad )				// Rotate it by the target's x-axis
				.pmul_invert( pose_b.world.rotation );									// Convert to Bone's Local Space

			pose.setBone( bind_c.idx, rotation );

			pose_c.world
				.copy( pose_b.world )
				.add( rotation, bind_c.local.position, bind_c.local.scale );
		}
}

export default IKTarget;