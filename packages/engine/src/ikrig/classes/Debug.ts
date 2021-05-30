import Points	from "../components/Points";
import Lines	from "../components/Lines";
import { getMutableComponent } from "../../ecs/functions/EntityFunctions";

class Debug{
	static p = null;
	static l = null;

    static init(){
		let e = Points.$( "debug_points" );
		this.p = getMutableComponent(e, Points);
		e = Lines.$( "debug_lines" );
		this.p = getMutableComponent(e, Lines);

		return this;
	}

	static reset(){
		this.p.reset();
		this.l.reset();
		return this;
	}

	static pnt( p, hex=0xff0000, shape=null, size=null ){ this.p.add( p, hex, shape, size ); return this; }
	static pnt_raw( x, y, z, hex=0xff0000, shape=null, size=null ){ this.p.add_raw( x, y, z, hex, shape, size ); return this; }

	static ln( p0, p1, hex_0=0xff0000, hex_1=null, is_dash=false ){ this.l.add( p0, p1, hex_0, hex_1, is_dash ); return this; }
	static ln_raw( x0, y0, z0, x1, y1, z1, hex_0=0xff0000, hex_1=null, is_dash=false ){ this.l.add_raw( x0, y0, z0, x1, y1, z1, hex_0, hex_1, is_dash ); return this; }
}

export default Debug;