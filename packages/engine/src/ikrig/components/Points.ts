import { BufferAttribute, BufferGeometry, DynamicDrawUsage, Points, RawShaderMaterial } from "three";
import { Component } from "../../ecs/classes/Component";
import { addComponent, createEntity, getComponent, getMutableComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import Obj from "./Obj";

class PointsComponent extends Component<PointsComponent>{
	cnt = 0;
	use_size = 10;
	use_shape = 1;
	buf_pos: BufferAttribute;
	buf_clr: BufferAttribute;
	geo: BufferGeometry;
	mesh: Points<any, any>;
	static $( name="points", max_len=100 ){
		const entity = createEntity();
		if(!hasComponent(entity, Obj)){
			addComponent(entity, Obj);
		}
		addComponent(entity, PointsComponent);
		getMutableComponent(entity, PointsComponent).init(name, max_len);

		return entity;
	}

    constructor(){
		super();
		this.cnt		= 0;	// How many items are in the buffer.
		this.use_size	= 10;	// Default size to use
		this.use_shape	= 1;	// Default Shape to use
	}

	init( name = "points", max_len = 100 ){

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// BUFFERS
        this.buf_pos = new BufferAttribute( new Float32Array( max_len * 4 ), 4 );
		this.buf_pos.setUsage( DynamicDrawUsage );

		this.buf_clr = new BufferAttribute( new Float32Array( max_len * 4 ), 4 );
		this.buf_clr.setUsage( DynamicDrawUsage );

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// GEOMETRY
        this.geo = new BufferGeometry();
		this.geo.setAttribute( "position",	this.buf_pos );
		this.geo.setAttribute( "color",		this.buf_clr );
		this.geo.setDrawRange( 0, 0 );

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// MESH
		this.mesh = new Points( this.geo, get_material() );
		this.mesh.name = name;

		let obj = getMutableComponent(this.entity, Obj);
		if(!obj) {
			addComponent(this.entity, Obj);
			obj = getMutableComponent(this.entity, Obj);
		}
		obj.setReference( this.mesh );

		return this;
	}
	entity_id(entity_id: any) {
		throw new Error("Method not implemented.");
	}

	
	add( p, hex=0xff0000, shape=null, size=null ){ return this.add_raw( p.x, p.y, p.z, hex, shape, size ); }
	add_raw( x, y, z, hex=0xff0000, shape=null, size=null ){
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// VERTEX POSITION - SIZE
		this.buf_pos.setXYZW( this.cnt, x, y, z, (size || this.use_size) );
		this.buf_pos.needsUpdate = true;

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// VERTEX COLOR - SHAPE
		const c = gl_color( hex );
		this.buf_clr.setXYZW( this.cnt, c[0], c[1], c[2], ((shape != null)? shape:this.use_shape) );
		this.buf_clr.needsUpdate = true;

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// INCREMENT AND UPDATE DRAW RANGE
		this.cnt++;
		this.geo.setDrawRange( 0, this.cnt );

		return this;
	}

	reset(){
		this.cnt = 0;
		this.geo.setDrawRange( 0, 0 );
		return this;
	}
}


// #region SHADER
let gMat = null;
function get_material(){
	if( gMat ) return gMat;

	gMat = new RawShaderMaterial( { 
		vertexShader	: vert_src, 
		fragmentShader	: frag_src, 
		transparent 	: true, 
		uniforms 		: { u_scale:{ value : 8.0 } } 
	} );

	return gMat;
}

const vert_src = `#version 300 es
in	vec4	position;
in	vec4	color;

uniform 	mat4	modelViewMatrix;
uniform 	mat4	projectionMatrix;
uniform 	float	u_scale;

out 	vec3	frag_color;
flat out int	frag_shape;

void main(){
	vec4 ws_position 	= modelViewMatrix * vec4( position.xyz, 1.0 );
	
	frag_color			= color.rgb;
	frag_shape			= int( color.w );

	gl_Position			= projectionMatrix * ws_position;
	gl_PointSize		= position.w * ( u_scale / -ws_position.z );

	// Get pnt to be World Space Size
	//gl_PointSize = view_port_size.y * projectionMatrix[1][5] * 1.0 / gl_Position.w;
	//gl_PointSize = view_port_size.y * projectionMatrix[1][1] * 1.0 / gl_Position.w;
	
}`;

const frag_src = `#version 300 es
precision mediump float;

#define PI	3.14159265359
#define PI2	6.28318530718

in		vec3		frag_color;
flat	in int		frag_shape;
out		vec4		out_color;

float circle(){ 
	vec2 coord		= gl_PointCoord * 2.0 - 1.0; // v_uv * 2.0 - 1.0;
	float radius	= dot( coord, coord );
	float dxdy 		= fwidth( radius );
	return smoothstep( 0.90 + dxdy, 0.90 - dxdy, radius );
}

float ring(){ 
	vec2 coord		= gl_PointCoord * 2.0 - 1.0;
	float radius	= dot( coord, coord );
	float dxdy 		= fwidth( radius );
	return	smoothstep( 0.2 - dxdy, 0.2 + dxdy, radius ) - 
			smoothstep( 1.0 - dxdy, 1.0 + dxdy, radius );
}

float diamond(){
	// http://www.numb3r23.net/2015/08/17/using-fwidth-for-distance-based-anti-aliasing/
	const float radius = 0.5;

	float dst = dot( abs(gl_PointCoord-vec2(0.5)), vec2(1.0) );
	float aaf = fwidth( dst );
	return 1.0 - smoothstep( radius - aaf, radius, dst );
}

float poly( int sides, float offset, float scale ){
	// https://thebookofshaders.com/07/
	vec2 coord = gl_PointCoord * 2.0 - 1.0;
	
	coord.y += offset;
	coord *= scale;

	float a = atan( coord.x, coord.y ) + PI; 	// Angle of Pixel
	float r = PI2 / float( sides ); 			// Radius of Pixel
	float d = cos( floor( 0.5 + a / r ) * r-a ) * length( coord );
	float f = fwidth( d );
	return smoothstep( 0.5, 0.5 - f, d );
}

void main(){
	float alpha = 1.0;

	if( frag_shape == 1 ) alpha = circle();
	if( frag_shape == 2 ) alpha = diamond();
	if( frag_shape == 3 ) alpha = poly( 3, 0.2, 1.0 );	// Triangle
	if( frag_shape == 4 ) alpha = poly( 5, 0.0, 0.65 ); // Pentagram
	if( frag_shape == 5 ) alpha = poly( 6, 0.0, 0.65 );	// Hexagon
	if( frag_shape == 6 ) alpha = ring();

	out_color = vec4( frag_color, alpha );
}`;

//gl_Position = projection * view * model * vec4(position.xyz, 1.0);
//gl_PointSize = pointsize - (distance(cameraeye, position.xyz) / pointsize);

/*
      // set point position
      vec3 position = position + translation;
      vec4 projected = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      gl_Position = projected;

      // use the delta between the point position and camera position to size point
      float xDelta = pow(projected[0] - cameraPosition[0], 2.0);
      float yDelta = pow(projected[1] - cameraPosition[1], 2.0);
      float zDelta = pow(projected[2] - cameraPosition[2], 2.0);
      float delta  = pow(xDelta + yDelta + zDelta, 0.5);
	  gl_PointSize = 10000.0 / delta;
*/

// #endregion


function gl_color( hex, out = null ){
	const NORMALIZE_RGB = 1 / 255;
	out = out || [0,0,0];

	out[0] = ( hex >> 16 & 255 ) * NORMALIZE_RGB;
	out[1] = ( hex >> 8 & 255 ) * NORMALIZE_RGB;
	out[2] = ( hex & 255 ) * NORMALIZE_RGB;

	return out;
}

export default PointsComponent;