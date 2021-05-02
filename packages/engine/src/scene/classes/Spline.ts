import { 
	Vector3,
	BufferGeometry,
	Mesh,
	BufferAttribute,
	CatmullRomCurve3, Line, LineBasicMaterial,
	MeshLambertMaterial,
	Object3D
  } from "three";
import SplineHelperNode from "../../editor/nodes/SplineHelperNode";


export default class Spline extends Object3D {
	_splineHelperObjects = [];
	_splinePointsLength = 2;
	_positions = [];
	_point = new Vector3();

	_splines = {} as any;

	ARC_SEGMENTS = 200;

	constructor() {
		super();
	}

	init() {
		
		/*******
		 * Curves
		 *********/

		console.log("Spline Init");

		 for ( let i = 0; i < this._splinePointsLength; i ++ ) {

			this.addSplineObject( this._positions[ i ] );

		}

		this._positions.length = 0;

		for ( let i = 0; i < this._splinePointsLength; i ++ ) {

			this._positions.push( this._splineHelperObjects[ i ].position );

		}

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( this.ARC_SEGMENTS * 3 ), 3 ) );

		let curve = new CatmullRomCurve3( this._positions );
		curve.curveType = 'catmullrom';
		curve.mesh = new Line( geometry.clone(), new LineBasicMaterial( {
			color: 0xff0000,
			opacity: 0.35
		} ) );
		curve.mesh.castShadow = true;
		this._splines.uniform = curve;

		// curve = new CatmullRomCurve3( this._positions );
		// curve.curveType = 'centripetal';
		// curve.mesh = new Line( geometry.clone(), new LineBasicMaterial( {
		// 	color: 0x00ff00,
		// 	opacity: 0.35
		// } ) );
		// curve.mesh.castShadow = true;
		// this._splines.centripetal = curve;

		// curve = new CatmullRomCurve3( this._positions );
		// curve.curveType = 'chordal';
		// curve.mesh = new Line( geometry.clone(), new LineBasicMaterial( {
		// 	color: 0x0000ff,
		// 	opacity: 0.35
		// } ) );
		// curve.mesh.castShadow = true;
		// this._splines.chordal = curve;

		for ( const k in this._splines ) {

			const spline = this._splines[ k ];
			spline.mesh.layers.set(1);
			super.add( spline.mesh );

		}

		this.load( [ new Vector3( 0, 0.514, 0.10018915737797 ),
			new Vector3( 1.56300074753207, 1.49711742836848, 1.495472686253045 )] );
	}

	addSplineObject( position = null ) {

		// this.editor is added when object is instantiated.
		const splineHelperNode = new SplineHelperNode(this.editor, this);
		const object = splineHelperNode; //.children[0];

		if ( position ) {

			object.position.copy( position );

		} else {

			object.position.x = Math.random() * 10 - 5;
			object.position.y = Math.random() * 6;
			object.position.z = Math.random() * 8 - 4;

		}

		object.castShadow = true;
		object.receiveShadow = true;
		super.add( object );
		this._splineHelperObjects.push( object );
		return object;

	}

	addPoint() {

		this._splinePointsLength ++;

		this._positions.push( this.addSplineObject().position );

		this.updateSplineOutline();

	}

	removePoint() {

		if ( this._splinePointsLength <= this._splinePointsLength ) {

			return;

		}

		const point = this._splineHelperObjects.pop();
		this._splinePointsLength --;
		this._positions.pop();

		// if ( transformControl.object === point ) transformControl.detach();
		super.remove( point );

		this.updateSplineOutline();

	}

	updateSplineOutline() {

		for ( const k in this._splines ) {

			const spline = this._splines[ k ];

			const splineMesh = spline.mesh;
			const position = splineMesh.geometry.attributes.position;

			for ( let i = 0; i < this.ARC_SEGMENTS; i ++ ) {

				const t = i / ( this.ARC_SEGMENTS - 1 );
				spline.getPoint( t, this._point );
				position.setXYZ( i, this._point.x, this._point.y, this._point.z );

			}

			position.needsUpdate = true;

		}

	}

	exportSpline() {

		const strplace = [];

		for ( let i = 0; i < this._splinePointsLength; i ++ ) {

			const p = this._splineHelperObjects[ i ].position;
			strplace.push( `new Vector3(${p.x}, ${p.y}, ${p.z})` );

		}

		console.log( strplace.join( ',\n' ) );
		const code = '[' + ( strplace.join( ',\n\t' ) ) + ']';
		prompt( 'copy and paste code', code );

	}

	load( new_positions ) {

		while ( new_positions.length > this._positions.length ) {

			this.addPoint();

		}

		while ( new_positions.length < this._positions.length ) {

			this.removePoint();

		}

		for ( let i = 0; i < this._positions.length; i ++ ) {

			this._positions[ i ].copy( new_positions[ i ] );

		}

		this.updateSplineOutline();

	}
}