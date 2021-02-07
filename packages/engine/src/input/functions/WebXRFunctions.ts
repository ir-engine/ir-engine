import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { Matrix4, MeshPhongMaterial, Vector3 } from 'three';
import { GLTFLoader } from "../../assets/loaders/gltf/GLTFLoader";
import { addComponent, getComponent, removeComponent } from '../../ecs/functions/EntityFunctions';
import { WebXRSession } from '../components/WebXRSession';
import { XRControllersComponent } from '../components/XRControllersComponent';

let container;

let controller1, controller2;
let controllerGrip1, controllerGrip2;

let particularArray

// eslint-disable-next-line prefer-const
let raycaster, intersected = [];
const tempMatrix = new Matrix4();

let controls, group;

export function initControllersVR(actorEntity) {
  // controllers

    const controller1 = Engine.renderer.xr.getController( 0 );
  //  controller1.addEventListener( 'selectstart', (e) => {selectStart(e, 0)} );
  //  controller1.addEventListener( 'selectend', e => {onSelectEnd(e,0)} );
    Engine.scene.add( controller1 );

    const controller2 = Engine.renderer.xr.getController( 1 );
  //  controller2.addEventListener( 'selectstart', (e) => {selectStart(e, 1)} );
  //  controller2.addEventListener( 'selectend', e => {onSelectEnd(e,1)} );
    Engine.scene.add( controller2 );

    /////var controllerModelFactory = new XRControllerModelFactory();

    controllerGrip1 = Engine.renderer.xr.getControllerGrip( 0 );
    controllerGrip2 = Engine.renderer.xr.getControllerGrip( 1 );

    addComponent(actorEntity, XRControllersComponent, {
      controller1: controller1,
      controller2: controller2,
      position1: controller1.position,
      position2: controller2.position,
      rotation1: controller1.quaternion,
      rotation2: controller2.quaternion,
      controllerGrip1: controllerGrip1,
      controllerGrip2: controllerGrip2

    })
    console.warn(getComponent(actorEntity, XRControllersComponent));
    console.warn(controller1);



    new GLTFLoader().load('../models/webxr/controllers/valve_controller_knu_1_0_right.glb', obj => {

    //  new TextureLoader().load('./models/controllers/valve_controller_knu_1_0_right_spec.png',
  //    texture => {
  //      new TextureLoader().load('./models/controllers/valve_controller_knu_1_0_right_diff.png',
  //      texture2 => {
      //    console.warn(obj);
          const mesh = obj.scene.children[2] as any;

          mesh.material = new MeshPhongMaterial()
      //    texture.anisotropy = 16
      //    texture.wrapS = texture.wrapT = RepeatWrapping;
      //    mesh.material.map = texture2;
    //      mesh.material.specularMap = texture;
          //mesh.position.y = 0.1;
          mesh.position.z = -0.08 ;
          const mesh2 = mesh.clone()

      //    console.warn(obj);

          mesh2.scale.multiply(new Vector3(-1, 1, 1));

          controllerGrip1.add( mesh );
          Engine.scene.add( controllerGrip1 );


          controllerGrip2.add( mesh2 );
          Engine.scene.add( controllerGrip2 );
          console.warn('Loaded Model Controllers Done');
    //    });

    //  });

    })
}


function selectStart( event, n ) {


	const currentIndex = []
	const controllerPosition = new Vector3(
		event.target.position.x,
		event.target.position.y,
		event.target.position.z
	)
/*
	for (let i = 0; i < particularArray.length; i++) {

    let diff = new Vector3().subVectors( particularArray[i].position, controllerPosition).length()
		//console.log(diff);
		if( diff < 30) {
			currentIndex.push(i)
		}
	}
	currentIndex.sort((a, b) => a - b)
*/
	//console.log(particularArray[currentIndex[0]]);
/*
	if (currentIndex.length > 0) {
		if (!n) {
			window.clothSimulatorApp.booleanNeed = true
			window.clothSimulatorApp.currentIndexNeed = particularArray[currentIndex[0]]
		} else {
			window.clothSimulatorApp.booleanNeed2 = true
			window.clothSimulatorApp.currentIndexNeed2 = particularArray[currentIndex[0]]
		}
	}
  */
//	window.clothSimulatorApp.memoryNeed
}



function onSelectEnd( event, n ) {

}
/*
function getIntersections( controller ) {

	tempMatrix.identity().extractRotation( controller.matrixWorld );

	raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
	raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

	return raycaster.intersectObjectsVR( group.children );

}
*/
let button

export function initVR (actorEntity) {
	if(!navigator || !(navigator as any).xr)
		return console.warn("Not initializing WebXR on this platform because it is not supported");	

	button = document.createElement( 'button' );
	button.id = 'VRButton';
	// if (!(navigator as any).xr.isSessionSupported( 'immersive-vr' ))
	// 	button.style.display = 'none';

	stylizeElement( button );

  document.body.appendChild( button );
	Engine.renderer.xr.enabled = true;
	Engine.renderer.xr.setReferenceSpaceType( 'local-floor' );
	(navigator as any).xr.isSessionSupported( 'immersive-vr' ).then( ( supported ) => {
		supported ? showEnterVR(actorEntity, button) : showWebXRNotFound(button);
	});
}


function showEnterVR(actorEntity, button ) {

	function onSessionStarted( session ) {
		Engine.renderer.xr.setSession( session );
		button.textContent = 'EXIT VR'
	}

	function onSessionEnded() {
		button.textContent = 'ENTER VR'
	}

	button.onclick = function () {
		if ( Engine.xrSession === null ) {

			const sessionInit = { optionalFeatures: [ 'local-floor', 'bounded-floor' ] };
		//	var sessionInit = { optionalFeatures: [ "unbounded" ] };
		//	var sessionInit = { optionalFeatures:  [ "local" ] };
			(navigator as any).xr.requestSession( "immersive-vr", sessionInit ).then((session) => {
        addComponent(actorEntity, WebXRSession, { session });
				Engine.xrSession = session;
        onSessionStarted(session)
        initControllersVR(actorEntity)
      });

		} else {
      removeComponent(actorEntity, WebXRSession);
      removeComponent(actorEntity, XRControllersComponent);
      Engine.xrSession.end();
			Engine.xrSession = null;
			onSessionEnded();
		}
	};
}
/*
export function createWebGLContext() {
  let webglCanvas = document.querySelector("canvas");
  let contextTypes =  ['webgl2','webgl', 'experimental-webgl'];
  let context = null;
  for (let contextType of contextTypes) {
    context = webglCanvas.getContext(contextType, { xrCompatible: true });
    if (context) {
      break;
    }
  }
  if (!context) {
    console.error('This browser does not support WebGL');
    return null;
  }
  return context;
}
*/
function disableButton() {
	button.style.display = '';
	button.style.cursor = 'auto';
	button.style.left = 'calc(50% - 75px)';
	button.style.width = '150px';
	button.onmouseenter = null;
	button.onmouseleave = null;
	button.onclick = null;
}

function showWebXRNotFound(button) {
	disableButton();
	button.textContent = 'VR NOT SUPPORTED';
}

function stylizeElement( element ) {
	element.style.position = 'absolute';
	element.style.bottom = '20px';
	element.style.padding = '12px 6px';
	element.style.border = '1px solid #fff';
	element.style.borderRadius = '4px';
	element.style.background = 'rgba(0,0,0,0.1)';
	element.style.color = '#fff';
	element.style.font = 'normal 13px sans-serif';
	element.style.textAlign = 'center';
	element.style.opacity = '0.5';
	element.style.outline = 'none';
	element.style.zIndex = '999';
	element.style.display = '';
	element.style.cursor = 'pointer';
	element.style.left = 'calc(50% - 50px)';
	element.style.width = '100px';
	element.textContent = 'ENTER VR';
	element.onmouseenter = function () {
		element.style.opacity = '1.0';
	}
	element.onmouseleave = function () {
		element.style.opacity = '0.5';
	}
}
