
import {
    Plane, MeshPhongMaterial,
    MeshBasicMaterial, TubeBufferGeometry,
    Raycaster,
    CatmullRomCurve3,BufferGeometry,Line,LineBasicMaterial,Mesh,
    Scene, Vector2,
    Vector3
  } from "three";


function CurveEditor() {


	var handles = [];
	var sections = {};
	var raycastList = [];
	var selectedHandle ;

	var plane = new Plane( new Vector3(0, 0, -1) );

	var raycaster = new Raycaster();
	raycaster.linePrecision = 0.5 ;

	var cornerMaterial = new MeshPhongMaterial({color:0xff00ff});
	var twistMaterial = new MeshPhongMaterial({color:0xffff00});
	var selectMaterial = new MeshPhongMaterial({color:0xffffff});
	var tubeMaterial = new MeshBasicMaterial({
		transparent:true,
		opacity:0
	});

	var nextHandle = "twist" ;





	function switchHandleType() {
		nextHandle = nextHandle == 'twist' ? 'corner' : 'twist' ;
	};



	// deleteHandle() delete the selected handle. It behaves differently
	// wether the handle is a 'twist' or an 'angle' : if it's a 'twist',
	// the curve need only be recomputed without the removed handle.
	// If it's a 'corner' however, a new curve joining the two previously
	// separated by the corner must be created.
	function deleteHandle( currentLayout ) {

		let section = selectedHandle.section_curves[0].section ;
		
		// check if the passed string is the name of the selected handle's section
		if ( currentLayout == section.name ) {

			let rayID = raycastList.indexOf(selectedHandle);
			raycastList.splice( rayID, 1 );

			if ( selectedHandle.name == 'twist' ) {
				
				let handleID = selectedHandle.section_curves[0]
									.handles.indexOf( selectedHandle );

				selectedHandle.section_curves[0].handles.splice( handleID, 1 );
				
				computeCurve( selectedHandle.section_curves[0] );
				drawLineHelper() ;

			} else if ( selectedHandle.name == 'corner' ) {

				// Get the two curves that must be joined
				let curveStart = selectedHandle.section_curves[0]
				let curveEnd = selectedHandle.section_curves[1]

				// make sure that we will pop() and shift() the right arrays
				if ( curveStart.handles.indexOf( selectedHandle ) == 0 ) {
					[ curveStart, curveEnd ] = [ curveEnd, curveStart ];
					console.log('switch')
				};

				curveStart.handles.pop();
				curveEnd.handles.shift();
				
				// creates a new array of handles joining the two
				let handles = curveStart.handles.concat( curveEnd.handles );

				// creates a new curve from the new handles array
				let curve = Curve( handles.map( (h)=> h.position), handles, section );
				section.curves.push( curve );
				scene.add( curve.lineObj, curve.tube );

				// delete the previous two curves
				deleteCurve( curveStart, section.curves );
				deleteCurve( curveEnd, section.curves );

			};


			scene.remove( selectedHandle );
			selectedHandle = undefined ;

		};
	};



	// update() make the selected handle shine periodically,
	// so the user knows which handle is the selected one.
	function update() {
		let scalar = (Math.sin( Date.now() / 150 ) + 2) / 4 ;
		selectMaterial.emissive.setScalar( scalar ) ;
	};



	function raycast( mouse ) {

		// update the picking ray with the camera and mouse position
		raycaster.setFromCamera( mouse, camera );

		// calculate objects intersecting the picking ray
		var intersects = raycaster.intersectObjects( raycastList );

		if ( intersects.length > 0 ) {

			let interstedHandle = intersects.find( (intersect)=> {
				return ( intersect.object.name == "twist" ||
						 intersect.object.name == "corner" );
			});

			if ( typeof interstedHandle == 'undefined' ) {

				if ( nextHandle == "twist" ) {

					addTwist( intersects[0].object.section_curve,
							  intersects[0].point );

				} else if ( nextHandle == "corner" ) {

					addCorner( intersects[0].object.section_curve,
							   intersects[0].point );

				};

			} else {

				grabHandle( interstedHandle.object );

			};

		};

	};




	function selectHandle( handle ) {

			if ( selectedHandle ) {
			selectedHandle.material = selectedHandle.name == 'twist' ?
											twistMaterial :
											cornerMaterial ;
										};

			selectedHandle = handle ;
			selectedHandle.material = selectMaterial ;
		};




	function grabHandle( handle ) {

		selectHandle( handle );
		
		window.addEventListener( 'mousemove', onGrabMove );
		window.addEventListener( 'mouseup', onGrabEnd );

		function onGrabEnd() {

			window.removeEventListener( 'mouseup', onGrabEnd );
			window.removeEventListener( 'mousemove', onGrabMove );

			// This creates the tube mesh according to the new curves
			drawLineHelper()
		};

		function onGrabMove() {

			// calculate mouse position in normalized device coordinates
			// (-1 to +1) for both components
			mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

			// update the picking ray with the camera and mouse position
			raycaster.setFromCamera( mouse, camera );

			// moves the handle to the new position
			raycaster.ray.intersectPlane( plane, handle.position ) ;

			// Recompute the curve object ///

			let curves = handle.section_curves ;

			for (let i=0 ; i<curves.length ; i++) {
				computeCurve( curves[i] );
			};

		};

	};




	function computeCurve( curve ) {

		// recompute the curve
		let points = curve.handles.map( (h)=> h.position );
		curve.curve.points = points ;
		curve.points = curve.curve.getPoints(64);

		// redraw the line
		curve.lineGeom.setFromPoints( curve.points );
	};




	function drawLineHelper() {

		let curves = selectedHandle.section_curves ;

		for (let i=0 ; i<curves.length ; i++) {
			curves[i].tube.geometry = new TubeBufferGeometry(
				curves[i].curve, 64, 0.32 );
		};
	};





	// This function creates a new twist handle grossly where the user clicked,
	// and adds it in curve.handles (not at the end, but according to its
	// position on the curve).
	function addTwist( curve, vector3 ) {

		let twist = Twist( vector3 );
		twist.section_curves.push( curve );

		// first concat the new handle in the array, then sort it
		curve.handles = curve.handles
				.concat( twist )
				.sort( (handle1, handle2)=> {
					let id1 =  closestPoint( handle1, curve.points );
					let id2 =  closestPoint( handle2, curve.points );
					return id1 - id2 ;
				});

		computeCurve( twist.section_curves[0] );

		selectHandle( twist )

	};




	// addCorner() creates a new 'corner' handle, create two new curve starting from
	// the new angle, then delete the curve from which it was created.
	function addCorner( curve, vector3 ) {

		let corner = Corner( vector3 );

		let section = curve.section ;

		// first concat the new handle in the array, then sort it
		curve.handles = curve.handles
				.concat( corner )
				.sort( (handle1, handle2)=> {
					let id1 = closestPoint( handle1, curve.points );
					let id2 = closestPoint( handle2, curve.points );
					return id1 - id2 ;
				});

		// create two sets of handles
		let handles1 = curve.handles.slice( 0, curve.handles.indexOf( corner ) + 1 );
		let handles2 = curve.handles.slice(
								curve.handles.indexOf( corner ),
								curve.handles.length );

		// create two new curves from the new sets of handles
		let curve1 = Curve( handles1.map( (h)=> h.position), handles1, section );
		let curve2 = Curve( handles2.map( (h)=> h.position), handles2, section );

		section.curves.push( curve1, curve2 );
		scene.add( curve1.lineObj, curve2.lineObj );
		scene.add( curve1.tube, curve2.tube );

		deleteCurve( curve, section.curves );
	};




	// This function remove the passed curve from the passed curves array and
	// from the raycastList. It also remove the cruve object ad a scene children.
	// It must still be disposed.
	function deleteCurve( curveToDelete, curvesArray ) {

		let idCurve = curvesArray.indexOf( curveToDelete );
		curvesArray.splice( idCurve, 1 );

		for (let i=0 ; i<curveToDelete.handles.length ; i++) {

			let section_curves = curveToDelete.handles[i].section_curves;
			let id = section_curves.indexOf( curveToDelete );
			
			if ( id > -1 ) {
				section_curves.splice( id, 1 ) ;
			};
			
		};

		// delete tube
		let idRay = raycastList.indexOf( curveToDelete.tube );
		raycastList.splice( idRay, 1 );

		scene.remove( curveToDelete.tube );
		curveToDelete.tube.geometry.dispose();
		curveToDelete.tube = undefined ;

		scene.remove( curveToDelete.lineObj );

	};




	// This utility is used by addTwist() to place a new handle correctly in
	// the curve.handles array.
	function closestPoint( handle, vecArray ) {

		let v1 = handle.position ;
		let minDist = Infinity ;
		let closest ;

		// search the closest point on the curve
		for (let i=0 ; i<vecArray.length ; i++) {

			if ( v1.distanceTo( vecArray[i] ) < minDist ) {
				closest = i ;
				minDist = v1.distanceTo( vecArray[i] );
			};
		};

		return closest ; // return an ID, not a vector3
	};



	// This is called to create a section, it takes an array containing 
	// sub-arrays like this : ["corner", new Vector(0, 1, 0)].
	// It returns the section created, which will be passed as argument
	// in other methods.
	function Section( name, array ) {

		sections[ name ] = {
			curves: [],
			handles: [],
			name
		};


		// This go through the passed array and create handles accordingly.
		// It adds each new handles to the handles array.
		for (let i=0 ; i<array.length ; i++) {

			if ( array[i][0] == "corner" ) {
				sections[ name ].handles.push( Corner(array[i][1]) );
			} else { // must be "twist"
				sections[ name ].handles.push( Twist(array[i][1]) );
			};
		};


		// This create an array containing chunks of handles according to
		// the curves we want to create. Example :
		// [ ["corner", "corner"], ["corner", "twist", "corner"] ]
		// Every time a "corner" handle is found in the handles array,
		// a new sub-array is created, and the found "corner" is set as
		// the end of the last, and the start of the new chunk.
		var handleChunks = sections[ name ].handles.reduce( (newArr, handle, index)=> {

			if ( handle.name == "corner" ) {

				// check if there was a chunk previously created, and append
				// it the current handle.
				if (newArr.length > 0) {
					newArr[ newArr.length -1 ].push( handle );
				};

				// create a new chunk if the current handle is not the last.
				if ( index != sections[ name ].handles.length -1 ) newArr.push( [handle] );

			} else { // handle is a "twist"

				// append the current handle to the last chunk created.
				newArr[ newArr.length -1 ].push( handle );

			};

			return newArr ;

		}, [] /* create an empty array as accumulator */ );

		


		// This part creates the curves from the sub-arrays of handleChunks
		for (let i=0 ; i<handleChunks.length ; i++) {

			let points = handleChunks[i].map( (handle)=> {
				return handle.position ;
			});

			let curve = Curve( points, handleChunks[i], sections[name] ) ;
			sections[ name ].curves.push( curve ) ;
			scene.add( curve.lineObj, curve.tube );
		};

		console.log( sections[ name ] );

		return sections[ name ] ;

	};





	// Curve return an object containing all we need to make an interactive
	// curve : the catmullRom object, a line created from the curve splitted
	// into 64 points, a tube created from the curve (for raycasting), and
	// a Line object for drawing the curve in the scene.
	function Curve( vectorsArray, handles, section ) {

		let curve = new CatmullRomCurve3( vectorsArray );
		curve.curveType = 'catmullrom';
		curve.tension = 0.55 ;

		let lineGeom = new BufferGeometry();

		let points = curve.getPoints(64);

		lineGeom.setFromPoints( points );

		let lineObj = new Line( lineGeom,
			new LineBasicMaterial({ color : 0xff00ff }) );

		
		let tube = new Mesh(
			new TubeBufferGeometry( curve, 64, 0.32 ),
			tubeMaterial
			);
		tube.name = 'line_helper';

		raycastList.push( tube );
		
		let obj = {
			curve,
			lineGeom,
			points,
			lineObj,
			tube,
			handles,
			type: "section_curve",
			section
		};

		obj.curve.section_curve = obj ;
		obj.tube.section_curve = obj ;
		obj.lineObj.section_curve = obj ;
		obj.handles.section_curve = obj ;
		obj.points.section_curve = obj ;


		for ( let i=0 ; i<obj.handles.length ; i++ ) {
			obj.handles[i].section_curves.push( obj ) ;
		};

		return obj ;

	};







	////////////////
	///  HANDLES
	////////////////


	// This returns a cube with "corner" as a name
	function Corner(vector3) {
		
		let cube = new Mesh(
			new BoxBufferGeometry(0.6, 0.6, 0.6),
			cornerMaterial );

		cube.name = "corner" ;
		cube.position.copy( vector3 );
		cube.section_curves = [] ;

		scene.add( cube );
		raycastList.push( cube );

		return cube ;
	};


	// This returns a sphere with "twist" as a name
	function Twist(vector3) {

		let sphere = new Mesh(
			new SphereBufferGeometry(0.3, 8, 8),
			twistMaterial );
		
		sphere.name = "twist" ;
		sphere.position.copy( vector3 );
		sphere.section_curves = [] ;

		scene.add( sphere );
		raycastList.push( sphere );

		return sphere ;
	};






	return {
		Section,
		raycast,
		deleteHandle,
		update,
		switchHandleType
	};
};