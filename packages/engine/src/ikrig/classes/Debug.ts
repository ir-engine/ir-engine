import Lines	from "../components/Lines";
import { addComponent, createEntity, getMutableComponent } from "../../ecs/functions/EntityFunctions";
import PointsComponent from "../components/Points";
import Obj from "../components/Obj";

class Debug{
	static points = null;
	static lines = null;

    static init(){
		const entity = createEntity();
		addComponent(entity, Obj);

		addComponent(entity, PointsComponent);
		this.points = getMutableComponent(entity, PointsComponent);
		this.points.init();

		addComponent(entity, Lines);
		this.lines = getMutableComponent(entity, Lines);
		this.lines.init();
		return this;
	}

	static reset(){
		this.points.reset();
		this.lines.reset();
		return this;
	}

	static setPoint( p, hex: any=0xff0000, shape=null, size=null ){ this.points.add( p, hex, shape, size ); return this; }
	static setPointRaw( x, y, z, hex=0xff0000, shape=null, size=null ){ this.points.addRaw( x, y, z, hex, shape, size ); return this; }

	static setLine( p0, p1, hex_0: any=0xff0000, hex_1=null, is_dash=false ){ this.lines.add( p0, p1, hex_0, hex_1, is_dash ); return this; }
	static setLineRaw( x0, y0, z0, x1, y1, z1, hex_0=0xff0000, hex_1=null, is_dash=false ){ this.lines.addRaw( x0, y0, z0, x1, y1, z1, hex_0, hex_1, is_dash ); return this; }
}

export default Debug;