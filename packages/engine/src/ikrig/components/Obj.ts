import { Component } from "../../ecs/classes/Component";
import { Engine } from "../../ecs/classes/Engine";
import { Types } from "../../ecs/types/Types";
import Quat from "../math/Quat";
import Vec3 from "../math/Vec3";

class Obj extends Component<Obj>{
	ref: any  = null;

	dispose(){ this.ref = null; }

	set_pos( ...p ){
		if( p.length == 3 ) this.ref.position.fromArray( p );
		return this;
	}

	set_scl( x, y, z ){
		if( arguments.length == 1 ) this.ref.scale.set( x, x, x );
		else 						this.ref.scale.set( x, y, z );
		return this;
	}

	set_rot( q ){ this.ref.quaternion.fromArray( q ); return this; }
	look( dir, up ){
		const q = new Quat().from_look( dir, up || Vec3.UP );
		this.ref.quaternion.fromArray( q );
		return this;
	}

	get_transform(){
		const p = this.ref.position,
			q = this.ref.quaternion,
			s = this.ref.scale;
		return {
			pos: [ p.x, p.y, p.z ],
			rot: [ q.x, q.y, q.z, q.w ],
			scl: [ s.x, s.y, s.z ],
		};
	}

	set_ref( o ){
		this.ref = o; 
		Engine.scene.add( o );
		return this;
	}

}

// Components need to have a schema so that they can construct efficiently
Obj._schema = {
    ref: { type: Types.Ref, default: null },
};

export default Obj;