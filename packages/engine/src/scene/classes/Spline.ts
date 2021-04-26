import {
	Vector2, Vector3,
	Raycaster,
	BoxGeometry,
	SphereBufferGeometry,
	BufferGeometry,
	Mesh,
	BufferAttribute,
	CatmullRomCurve3, Line, LineBasicMaterial,
	MeshLambertMaterial,
	Object3D
  } from "three";


export default class Spline extends Object3D {
	_splineHelperObjects = []; // Convert these to node objects
	_splinePointsLength = 3; // Set dynamically?
	_positions = [];
	_point = new Vector3();

	_splines = {} as any;

	// const raycaster = new Raycaster();
	// const pointer = new Vector2();
	// const onUpPosition = new Vector2();
	// const onDownPosition = new Vector2();

	_geometry = new BoxGeometry( 0.1, 0.1, 0.1 );
	// let transformControl;

	ARC_SEGMENTS = 200;

	// const params = {
	// 	uniform: true,
	// 	tension: 0.5,
	// 	centripetal: true,
	// 	chordal: true,
	// 	addPoint: addPoint,
	// 	removePoint: removePoint,
	// 	exportSpline: exportSpline
	// };

	constructor() {
		super();
		this.init();
		// transformControl.addEventListener( 'objectChange', function () {

		// 	updateSplineOutline();

		// } );

		// document.addEventListener( 'pointerdown', onPointerDown );
		// document.addEventListener( 'pointerup', onPointerUp );
		// document.addEventListener( 'pointermove', onPointerMove );
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

		debugger
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
			new Vector3( 1.56300074753207, 1.49711742836848, 1.495472686253045 ),
			new Vector3( 2.40118730204415, 2.4306956436485, 2.958271935582161 )] );
	}

	addSplineObject( position = null ) {

		const material = new MeshLambertMaterial( { color: Math.random() * 0xffffff } );
		const object = new Mesh( this._geometry, material );

		if ( position ) {

			object.position.copy( position );

		} else {

			object.position.x = Math.random() * 1000 - 500;
			object.position.y = Math.random() * 600;
			object.position.z = Math.random() * 800 - 400;

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

		if ( this._splinePointsLength <= 4 ) {

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

// render() {

// 	this._splines.uniform.mesh.visible = params.uniform;
// 	this._splines.centripetal.mesh.visible = params.centripetal;
// 	this._splines.chordal.mesh.visible = params.chordal;
// 	renderer.render( this, camera );

// }

// onPointerDown( event ) {

// 	onDownPosition.x = event.clientX;
// 	onDownPosition.y = event.clientY;

// }

// onPointerUp() {

// 	onUpPosition.x = event.clientX;
// 	onUpPosition.y = event.clientY;

// 	if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) transformControl.detach();

// }

// onPointerMove( event ) {

// 	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
// 	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

// 	raycaster.setFromCamera( pointer, camera );

// 	const intersects = raycaster.intersectObjects( this._splineHelperObjects );

// 	if ( intersects.length > 0 ) {

// 		const object = intersects[ 0 ].object;

// 		if ( object !== transformControl.object ) {

// 			transformControl.attach( object );

// 		}

// 	}

// }
