import { Component } from "../../ecs/classes/Component";
import { Engine } from "../../ecs/classes/Engine";
import { Types } from "../../ecs/types/Types";
import Quat from "../math/Quat";
import Vec3 from "../math/Vec3";

class Obj extends Component<Obj>{
	ref: any  = null;

	dispose(){ this.ref = null; }

	setPosition( ...p ){
		if( p.length == 3 ) this.ref.position.fromArray( p );
		return this;
	}

	look( dir, up ){
		const q = new Quat().setFromLookRotation( dir, up || Vec3.UP );
		this.ref.quaternion.fromArray( q );
		return this;
	}

	getTransform(){
		const p = this.ref.position,
			q = this.ref.quaternion,
			s = this.ref.scale;
		return {
			position: [ p.x, p.y, p.z ],
			rotation: [ q.x, q.y, q.z, q.w ],
			scale: [ s.x, s.y, s.z ],
		};
	}

	setReference( o ){
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