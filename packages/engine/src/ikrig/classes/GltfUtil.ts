import { Group, SkeletonHelper, BufferGeometry, BufferAttribute, Uint16BufferAttribute, Float32BufferAttribute, Mesh, SkinnedMesh } from "three";
import { Engine } from "../../ecs/classes/Engine";
import { addComponent, createEntity, getComponent, getMutableComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import Armature from "../components/Armature";
import Obj from "../components/Obj";
import Vec3 from "../math/Vec3";
import Gltf from "./Gltf";
 
class GltfUtil{
		static createSkeletalArmature( m_name, json, bin, armatureName=null ){

			const entity = createEntity();
			if(!hasComponent(entity, Armature)){
				addComponent(entity, Armature);
			}
			if(!hasComponent(entity, Obj)){
				addComponent(entity, Obj);
			}

			const o = getMutableComponent(entity, Obj);

			const m = new Group();
			m.name = m_name;
			o.setReference(m);

			GltfUtil.loadBonesInto( entity, json, bin, armatureName );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			const b = getComponent(entity, Armature).getRoot();
			o.ref.add( b );
			Engine.scene.add( new SkeletonHelper( b ) );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			Engine.scene.add( o.ref );
			return entity;
		}

		static createDebugArmature( m_name, json, bin, mat, m_names=null, armatureName=null ){
			console.log("Loading debug view");
			const m = GltfUtil.loadMesh( json, bin, mat, m_names, true );
			m.name			= m_name;
			mat.skinning	= true;		// Make Sure Skinning is enabled on the material

			const entity = createEntity();
			if(!hasComponent(entity, Obj)){
				addComponent(entity, Obj);
			}

			if(!hasComponent(entity, Armature)){
				addComponent(entity, Armature);
			}

			const o = getMutableComponent(entity, Obj);
			o.setReference(m);

			const armature = getMutableComponent(entity, Armature);

			GltfUtil.loadBonesInto( entity, json, bin, armatureName );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// TODO: Handle me, since I'm just adding this and might not be able to clean it up
			Engine.scene.add( new SkeletonHelper( armature.skeleton.bones[0] ) );
			return entity;
		}

		// Bin loading of Mesh Data into a Drawing Entity
		static loadMesh( json, bin, mat=null, meshNames=null, is_skinned=false ){
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Load all meshes in file
			if( !meshNames ){
				meshNames = [];
				for( let i=0; i < json.meshes.length; i++ ) meshNames.push( json.meshes[i].name );
			}

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Mesh can be made up of sub-meshes, So need to loop through em.
			let g, geometryArray
			const list = [];
			
			for(const n of meshNames ){
				geometryArray = Gltf.getMesh( n, json, bin, false ); // Load Type Arrays

				if( geometryArray.length == 1 )
					list.push( GltfUtil.makeGeometryMesh( geometryArray[0], mat, is_skinned ) );
				else						
					for( g of geometryArray ) 
						list.push( GltfUtil.makeGeometryMesh( g, mat, is_skinned ) );
				
			}

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Return mesh Or if multiple, a Group of Meshes.
			if( list.length == 1 ) return list[0];

			const rtn = new Group();
			for( g of list ) rtn.add( g );

			return rtn;
		}

		static loadGeometry( json, bin, meshNames=null ){
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Load all meshes in file
			if( !meshNames ){
				meshNames = [];
				for( let i=0; i < json.meshes.length; i++ ) meshNames.push( json.meshes[i].name );
			}

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Mesh can be made up of sub-meshes, So need to loop through em.
			let g, geometryArray;
			const list = [];
			
			for( const n of meshNames ){
				geometryArray = Gltf.getMesh( n, json, bin, false ); // Load Type Arrays

				if( geometryArray.length == 1 )
					list.push( GltfUtil.makeGeometry( geometryArray[0] ) );
				else						
					for( g of geometryArray ) 
						list.push( GltfUtil.makeGeometry( g ) );
				
			}

			return list;
		}

		static loadBonesInto( entity, json, bin, armatureName=null, def_len=0.1 ){
			const n_info	= {} as any, // Node Info
				armature 	= getMutableComponent(entity, Armature),
				bones 	= Gltf.getSkin( json, n_info, armatureName);
			
				console.log("n_info is", n_info);

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Create Bones
			const length	= bones.length,
				map = {}			// Create a Map of the First Child of Every Parent
			let i, b, be;

			for( i=0; i < length; i++ ){
				b	= bones[ i ];
				be	= armature.addBone( b.name, 1, b.p_idx );

				if( b.rotation ) be.quaternion.fromArray( b.rotation );
				if( b.position ) be.position.fromArray( b.position );
				if( b.scale ) be.scale.fromArray( b.scale );

				// Save First Child to Parent Mapping
				if( b.p_idx != null && !map[ b.p_idx ] ) map[ b.p_idx ] = i;
			}

			armature.finalize();
			const obj = getMutableComponent(entity, Obj);
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Set the Entity Transfrom from Armature's Node Transform if available.
			// Loading Meshes that where originally FBX need this to display correctly.
			if( n_info.scale ) obj.ref.scale.fromArray( n_info.scale );
			if( n_info.rotation ) obj.ref.quaternion.fromArray( n_info.rotation );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Calc the Length of Each Bone
			let c;
			for( i=0; i < length; i++ ){
				b = armature.bones[ i ];

				if( !map[ i ] ) b.length = def_len;
				else{
					c = armature.bones[ map[ i ] ]; // First Child's World Space Transform
					b.length = Vec3.magnitude( b.world.position, c.world.position ); // Distance from Parent to Child
				}
			}

			return entity;
		}

		// Create a Geo Buffer and Mesh from data from bin file.
		static makeGeometry( g ){
			const geo = new BufferGeometry();
			geo.setAttribute( "position", new BufferAttribute( g.vertices.data, g.vertices.comp_len ) );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			if( g.indices )
				geo.setIndex( new BufferAttribute( g.indices.data, 1 ) );

			if( g.normal )
				geo.setAttribute( "normal", new BufferAttribute( g.normal.data, g.normal.comp_len ) );

			if( g.uv )
				geo.setAttribute( "uv", new BufferAttribute( g.uv.data, g.uv.comp_len ) );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			geo.name = g.name;
			return geo;
		}

		// Create a Geo Buffer and Mesh from data from bin file.
		static makeGeometryMesh( g, mat, is_skinned=false ){
			const geo = new BufferGeometry();
			geo.setAttribute( "position", new BufferAttribute( g.vertices.data, g.vertices.comp_len ) );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			if( g.indices )
				geo.setIndex( new BufferAttribute( g.indices.data, 1 ) );

			if( g.normal )
				geo.setAttribute( "normal", new BufferAttribute( g.normal.data, g.normal.comp_len ) );

			if( g.uv )
				geo.setAttribute( "uv", new BufferAttribute( g.uv.data, g.uv.comp_len ) );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			if( is_skinned && g.joints && g.weights ){
				geo.setAttribute( "skinIndex", new Uint16BufferAttribute( g.joints.data, g.joints.comp_len ) );
				geo.setAttribute( "skinWeight", new Float32BufferAttribute( g.weights.data, g.weights.comp_len ) );
			}

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			const m = ( !is_skinned )?
				new Mesh( geo, mat ) :
				new SkinnedMesh( geo, mat );

			m.name = g.name;
			return m;
		}

		static getPose( entity, json, pose_name=null, do_world_calc=false ){
			if( !json.poses || json.poses.length == 0 ){ console.error("No Poses in file"); return null; }

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Find Which Pose To Use.
			let p_idx = 0;
			if( pose_name ){
				let i;
				for( i=0; i < json.poses.length; i++ ){
					if( json.poses[ i ].name == pose_name ){ p_idx = i; break; }
				}
				if( i != p_idx ){ console.log("Can not find pose by the name: ", pose_name ); return null; }
			}

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Save pose local space transform
			const bones	= json.poses[ p_idx ].joints,
				pose	= getMutableComponent(entity, Armature).createNewPose();
			let i, b;

			for( i=0; i < bones.length; i++ ){
				b = bones[ i ];
				pose.setBone( i, b.rotation, b.position, b.scale );
			}

			if( do_world_calc ) pose.updateWorld();

			return pose;
		}

}

export default GltfUtil;
export { Gltf };