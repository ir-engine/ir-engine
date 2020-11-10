import { Vector3, Vector4, PerspectiveCamera, ArrayCamera } from "three";
import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';

import { getComponent, hasComponent, getMutableComponent, addComponent } from '../../ecs/functions/EntityFunctions';
import { WebXRSession } from "../components/WebXRSession";
import { XRWebGLLayerOptions, XRSession } from '../types/WebXR';
import { XRControllersComponent } from '../components/XRControllersComponent';
import { ComponentConstructor } from '../../ecs/interfaces/ComponentInterfaces';
import { addColliderWithoutEntity } from '@xr3ngine/engine/src/physics/behaviors/addColliderWithoutEntity';
import { PhysicsManager } from '@xr3ngine/engine/src/physics/components/PhysicsManager';

/*
const cameraLPos = new Vector3();
const cameraRPos = new Vector3();

const cameraL = new PerspectiveCamera();
cameraL.layers.enable( 1 );
cameraL.viewport = new Vector4();

const cameraR = new PerspectiveCamera();
cameraR.layers.enable( 2 );
cameraR.viewport = new Vector4();

const cameras = [ cameraL, cameraR ];

const cameraVR = new ArrayCamera();
cameraVR.layers.enable( 1 );
cameraVR.layers.enable( 2 );


function updateCamera( camera, parent ) {
	if ( parent === null ) {
		camera.matrixWorld.copy( camera.matrix );
	} else {
		camera.matrixWorld.multiplyMatrices( parent.matrixWorld, camera.matrix );
	}
	camera.matrixWorldInverse.getInverse( camera.matrixWorld );
}



export function onFrameXR(timestamp, xrFrame, callbacks) {
  const session = xrFrame.session;
  const pose = xrFrame.getViewerPose(Engine.xrReferenceSpace);

  if ( pose !== null ) {
    const views = pose.views;
    const glLayer = session.renderState.baseLayer;
    // Run imaginary 3D engine's simulation to step forward physics, animations, etc.
    //scene.updateScene(timestamp, xrFrame);
  //  Engine.renderer.setFramebuffer( glLayer.framebuffer );
    Engine.context.bindFramebuffer(Engine.context.FRAMEBUFFER, glLayer.framebuffer);
    Engine.context.clear(Engine.context.COLOR_BUFFER_BIT | Engine.context.DEPTH_BUFFER_BIT);


    for (let view of pose.views) {
      let viewport = glLayer.getViewport(view);
      Engine.context.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
    //  Engine.scene.draw(view.projectionMatrix, view.transform);
      if (callbacks.render) callbacks.render();
    }

    let cameraVRNeedsUpdate = false;

    if ( views.length !== cameraVR.cameras.length ) {

      cameraVR.cameras.length = 0;
      cameraVRNeedsUpdate = true;

    }


    for ( let i = 0; i < views.length; i ++ ) {

				const view = views[ i ];
				const viewport = glLayer.getViewport( view );

				const camera = cameras[ i ];
				camera.matrix.fromArray( view.transform.matrix );
				camera.projectionMatrix.fromArray( view.projectionMatrix );
				camera.viewport.set( viewport.x, viewport.y, viewport.width, viewport.height );

				if ( i === 0 ) {

					cameraVR.matrix.copy( camera.matrix );

				}

				if ( cameraVRNeedsUpdate === true ) {

					cameraVR.cameras.push( camera );

				}

			}

      if (callbacks.render) callbacks.render(Engine.scene, cameraVR);

  }
}

*/

var dolly;
var cameraVector = new Vector3(); // create once and reuse it!
const prevGamePads = new Map();
var speedFactor = [0.1, 0.1, 0.1, 0.1];
let handedness;

export const webXRControllersBehaviors: Behavior = (entity: Entity) => {

};

export const addPhysics: Behavior = (entity: Entity) => {

//  const { session } = getComponent(entity, WebXRSession);
	const xRControllers = getMutableComponent(entity, XRControllersComponent)
	xRControllers.physicsBody1 = addColliderWithoutEntity(
		'sphere',
		xRControllers.position1,
		xRControllers.rotation1,
	  0.08,
		null
	)
	xRControllers.physicsBody2 = addColliderWithoutEntity(
		'sphere',
		xRControllers.position2,
		xRControllers.rotation2,
	  0.08,
		null
	)

//  Engine.context
//  Engine.xrSession


};
export const updatePhysics: Behavior = (entity: Entity) => {
	const xRControllers = getComponent(entity, XRControllersComponent)

	xRControllers.physicsBody1.position.set(
		xRControllers.position1.x,
		xRControllers.position1.y,
		xRControllers.position1.z
	);
	xRControllers.physicsBody2.position.set(
		xRControllers.position2.x,
		xRControllers.position2.y,
		xRControllers.position2.z
	);
	xRControllers.physicsBody1.quaternion.set(
		xRControllers.rotation1.x,
		xRControllers.rotation1.y,
		xRControllers.rotation1.z,
		xRControllers.rotation1.w
	);
	xRControllers.physicsBody2.quaternion.set(
		xRControllers.rotation2.x,
		xRControllers.rotation2.y,
		xRControllers.rotation2.z,
		xRControllers.rotation2.w
	);

	if (isIterable(Engine.xrSession.inputSources)) {
		console.warn('Engine.xrSession.inputSources');
		console.warn(Engine.xrSession.inputSources);
		let i = 0;
		for (const source of Engine.xrSession.inputSources) {
				if (source && source.handedness) {
						handedness = source.handedness; //left or right controllers
						console.warn('handedness');
						console.warn(handedness);
				}
				if (!source.gamepad) continue;
				const controller = Engine.renderer.xr.getController(i++);
				console.warn('controller');
				console.warn(controller);
				const old = prevGamePads.get(source);
				const data = {
						handedness: handedness,
						buttons: source.gamepad.buttons.map((b) => b.value),
						axes: source.gamepad.axes.slice(0)
				};

		};
	}
	function isIterable(obj) {  //function to check if object is iterable
	    // checks for null and undefined
	    if (obj == null) {
	        return false;
	    }
	    return typeof obj[Symbol.iterator] === "function";
	}
}

export const removePhysics: Behavior = (entity: Entity, args: any) => {
if (args.controllerPhysicalBody1) {
	PhysicsManager.instance.physicsWorld.removeBody(args.controllerPhysicalBody1)
	PhysicsManager.instance.physicsWorld.removeBody(args.controllerPhysicalBody2)
}
//  Engine.context
//  Engine.xrSession
};
/*
//// From webxr_vr_dragging example https://threejs.org/examples/#webxr_vr_dragging
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.119.1/build/three.module.min.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/controls/OrbitControls.min.js";
import { VRButton } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/webxr/VRButton.min.js";
import { XRControllerModelFactory } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/webxr/XRControllerModelFactory.min.js";

var container;
var camera, scene, renderer;
var controller1, controller2;
var controllerGrip1, controllerGrip2;

var raycaster,
    intersected = [];
var tempMatrix = new THREE.Matrix4();

var controls, group;

////////////////////////////////////////
//// MODIFICATIONS FROM THREEJS EXAMPLE
//// a camera dolly to move camera within webXR
//// a vector to reuse each frame to store webXR camera heading
//// a variable to store previous frames polling of gamepads
//// a variable to store accumulated accelerations along axis with continuous movement

var dolly;
var cameraVector = new THREE.Vector3(); // create once and reuse it!
const prevGamePads = new Map();
var speedFactor = [0.1, 0.1, 0.1, 0.1];

////
//////////////////////////////////////////
init();
animate();

function init() {
    container = document.createElement("div");
    document.body.appendChild(container);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x808080);

    camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        500  //MODIFIED FOR LARGER SCENE
    );
    camera.position.set(0, 1.6, 3);

    controls = new OrbitControls(camera, container);
    controls.target.set(0, 1.6, 0);
    controls.update();

    var geometry = new THREE.PlaneBufferGeometry(100, 100);
    var material = new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        roughness: 1.0,
        metalness: 0.0
    });
    var floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    scene.add(new THREE.HemisphereLight(0x808080, 0x606060));

    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 200, 0);           // MODIFIED SIZE OF SCENE AND SHADOW
    light.castShadow = true;
    light.shadow.camera.top = 200;           // MODIFIED FOR LARGER SCENE
    light.shadow.camera.bottom = -200;       // MODIFIED FOR LARGER SCENE
    light.shadow.camera.right = 200;         // MODIFIED FOR LARGER SCENE
    light.shadow.camera.left = -200;         // MODIFIED FOR LARGER SCENE
    light.shadow.mapSize.set(4096, 4096);
    scene.add(light);

    group = new THREE.Group();
    scene.add(group);

    var geometries = [
        new THREE.BoxBufferGeometry(0.2, 0.2, 0.2),
        new THREE.ConeBufferGeometry(0.2, 0.2, 64),
        new THREE.CylinderBufferGeometry(0.2, 0.2, 0.2, 64),
        new THREE.IcosahedronBufferGeometry(0.2, 3),
        new THREE.TorusBufferGeometry(0.2, 0.04, 64, 32)
    ];

    for (var i = 0; i < 100; i++) {
        var geometry = geometries[Math.floor(Math.random() * geometries.length)];
        var material = new THREE.MeshStandardMaterial({
            color: Math.random() * 0xffffff,
            roughness: 0.7,
            side: THREE.DoubleSide,   // MODIFIED TO DoubleSide
            metalness: 0.0
        });

        var object = new THREE.Mesh(geometry, material);

        object.position.x = Math.random() * 200 - 100;  // MODIFIED FOR LARGER SCENE
        object.position.y = Math.random() * 100;        // MODIFIED FOR LARGER SCENE
        object.position.z = Math.random() * 200 - 100;  // MODIFIED FOR LARGER SCENE

        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = Math.random() * 2 * Math.PI;
        object.rotation.z = Math.random() * 2 * Math.PI;

        object.scale.setScalar(Math.random() * 20 + 0.5);  // MODIFIED FOR LARGER SCENE

        object.castShadow = true;
        object.receiveShadow = true;

        group.add(object);
    }

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    //the following increases the resolution on Quest
    renderer.xr.setFramebufferScaleFactor(2.0);
    container.appendChild(renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer));

    // controllers
    controller1 = renderer.xr.getController(0);
    controller1.name="left";    ////MODIFIED, added .name="left"
    controller1.addEventListener("selectstart", onSelectStart);
    controller1.addEventListener("selectend", onSelectEnd);
    scene.add(controller1);

    controller2 = renderer.xr.getController(1);
    controller2.name="right";  ////MODIFIED added .name="right"
    controller2.addEventListener("selectstart", onSelectStart);
    controller2.addEventListener("selectend", onSelectEnd);
    scene.add(controller2);

    var controllerModelFactory = new XRControllerModelFactory();

    controllerGrip1 = renderer.xr.getControllerGrip(0);
    controllerGrip1.add(
        controllerModelFactory.createControllerModel(controllerGrip1)
    );
    scene.add(controllerGrip1);

    controllerGrip2 = renderer.xr.getControllerGrip(1);
    controllerGrip2.add(
        controllerModelFactory.createControllerModel(controllerGrip2)
    );
    scene.add(controllerGrip2);

    //Raycaster Geometry
    var geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1)
    ]);

    var line = new THREE.Line(geometry);
    line.name = "line";
    line.scale.z = 50;   //MODIFIED FOR LARGER SCENE

    controller1.add(line.clone());
    controller2.add(line.clone());

    raycaster = new THREE.Raycaster();

    ////////////////////////////////////////
    //// MODIFICATIONS FROM THREEJS EXAMPLE
    //// create group named 'dolly' and add camera and controllers to it
    //// will move dolly to move camera and controllers in webXR

    dolly = new THREE.Group();
    dolly.position.set(0, 0, 0);
    dolly.name = "dolly";
    scene.add(dolly);
    dolly.add(camera);
    dolly.add(controller1);
    dolly.add(controller2);
    dolly.add(controllerGrip1);
    dolly.add(controllerGrip2);

    ////
    ///////////////////////////////////

    window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onSelectStart(event) {
    var controller = event.target;

    var intersections = getIntersections(controller);

    if (intersections.length > 0) {
        var intersection = intersections[0];
        var object = intersection.object;
        object.material.emissive.b = 1;
        controller.attach(object);
        controller.userData.selected = object;
    }
}

function onSelectEnd(event) {
    var controller = event.target;
    if (controller.userData.selected !== undefined) {
        var object = controller.userData.selected;
        object.material.emissive.b = 0;
        group.attach(object);
        controller.userData.selected = undefined;
    }
}

function getIntersections(controller) {
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
    return raycaster.intersectObjects(group.children);
}

function intersectObjects(controller) {
    // Do not highlight when already selected

    if (controller.userData.selected !== undefined) return;

    var line = controller.getObjectByName("line");
    var intersections = getIntersections(controller);

    if (intersections.length > 0) {
        var intersection = intersections[0];

        ////////////////////////////////////////
        //// MODIFICATIONS FROM THREEJS EXAMPLE
        //// check if in webXR session
        //// if so, provide haptic feedback to the controller that raycasted onto object
        //// (only if haptic actuator is available)
        const session = renderer.xr.getSession();
        if (session) {  //only if we are in a webXR session
            for (const sourceXR of session.inputSources) {

                if (!sourceXR.gamepad) continue;
                if (
                    sourceXR &&
                    sourceXR.gamepad &&
                    sourceXR.gamepad.hapticActuators &&
                    sourceXR.gamepad.hapticActuators[0] &&
                    sourceXR.handedness == controller.name
                ) {
                    var didPulse = sourceXR.gamepad.hapticActuators[0].pulse(0.8, 100);
                }
            }
        }
        ////
        ////////////////////////////////

        var object = intersection.object;
        object.material.emissive.r = 1;
        intersected.push(object);

        line.scale.z = intersection.distance;
    } else {
        line.scale.z = 50;   //MODIFIED AS OUR SCENE IS LARGER
    }
}

function cleanIntersected() {
    while (intersected.length) {
        var object = intersected.pop();
        object.material.emissive.r = 0;
    }
}

function animate() {
    renderer.setAnimationLoop(render);
}

function render() {
    cleanIntersected();

    intersectObjects(controller1);
    intersectObjects(controller2);

    ////////////////////////////////////////
    //// MODIFICATIONS FROM THREEJS EXAMPLE

    //add gamepad polling for webxr to renderloop
    dollyMove();

    ////
    //////////////////////////////////////

    renderer.render(scene, camera);
}


////////////////////////////////////////
//// MODIFICATIONS FROM THREEJS EXAMPLE
//// New dollyMove() function
//// this function polls gamepad and keeps track of its state changes to create 'events'

function dollyMove() {
    var handedness = "unknown";

    //determine if we are in an xr session
    const session = renderer.xr.getSession();
    let i = 0;

    if (session) {
        let xrCamera = renderer.xr.getCamera(camera);
        xrCamera.getWorldDirection(cameraVector);

        //a check to prevent console errors if only one input source
        if (isIterable(session.inputSources)) {
            for (const source of session.inputSources) {
                if (source && source.handedness) {
                    handedness = source.handedness; //left or right controllers
                }
                if (!source.gamepad) continue;
                const controller = renderer.xr.getController(i++);
                const old = prevGamePads.get(source);
                const data = {
                    handedness: handedness,
                    buttons: source.gamepad.buttons.map((b) => b.value),
                    axes: source.gamepad.axes.slice(0)
                };
                if (old) {
                    data.buttons.forEach((value, i) => {
                        //handlers for buttons
                        if (value !== old.buttons[i] || Math.abs(value) > 0.8) {
                            //check if it is 'all the way pushed'
                            if (value === 1) {
                                //console.log("Button" + i + "Down");
                                if (data.handedness == "left") {
                                    //console.log("Left Paddle Down");
                                    if (i == 1) {
                                        dolly.rotateY(-THREE.Math.degToRad(1));
                                    }
                                    if (i == 3) {
                                        //reset teleport to home position
                                        dolly.position.x = 0;
                                        dolly.position.y = 5;
                                        dolly.position.z = 0;
                                    }
                                } else {
                                    //console.log("Right Paddle Down");
                                    if (i == 1) {
                                        dolly.rotateY(THREE.Math.degToRad(1));
                                    }
                                }
                            } else {
                                // console.log("Button" + i + "Up");

                                if (i == 1) {
                                    //use the paddle buttons to rotate
                                    if (data.handedness == "left") {
                                        //console.log("Left Paddle Down");
                                        dolly.rotateY(-THREE.Math.degToRad(Math.abs(value)));
                                    } else {
                                        //console.log("Right Paddle Down");
                                        dolly.rotateY(THREE.Math.degToRad(Math.abs(value)));
                                    }
                                }
                            }
                        }
                    });
                    data.axes.forEach((value, i) => {
                        //handlers for thumbsticks
                        //if thumbstick axis has moved beyond the minimum threshold from center, windows mixed reality seems to wander up to about .17 with no input
                        if (Math.abs(value) > 0.2) {
                            //set the speedFactor per axis, with acceleration when holding above threshold, up to a max speed
                            speedFactor[i] > 1 ? (speedFactor[i] = 1) : (speedFactor[i] *= 1.001);
                            console.log(value, speedFactor[i], i);
                            if (i == 2) {
                                //left and right axis on thumbsticks
                                if (data.handedness == "left") {
                                    // (data.axes[2] > 0) ? console.log('left on left thumbstick') : console.log('right on left thumbstick')

                                    //move our dolly
                                    //we reverse the vectors 90degrees so we can do straffing side to side movement
                                    dolly.position.x -= cameraVector.z * speedFactor[i] * data.axes[2];
                                    dolly.position.z += cameraVector.x * speedFactor[i] * data.axes[2];

                                    //provide haptic feedback if available in browser
                                    if (
                                        source.gamepad.hapticActuators &&
                                        source.gamepad.hapticActuators[0]
                                    ) {
                                        var pulseStrength = Math.abs(data.axes[2]) + Math.abs(data.axes[3]);
                                        if (pulseStrength > 0.75) {
                                            pulseStrength = 0.75;
                                        }

                                        var didPulse = source.gamepad.hapticActuators[0].pulse(
                                            pulseStrength,
                                            100
                                        );
                                    }
                                } else {
                                    // (data.axes[2] > 0) ? console.log('left on right thumbstick') : console.log('right on right thumbstick')
                                    dolly.rotateY(-THREE.Math.degToRad(data.axes[2]));
                                }
                                controls.update();
                            }

                            if (i == 3) {
                                //up and down axis on thumbsticks
                                if (data.handedness == "left") {
                                    // (data.axes[3] > 0) ? console.log('up on left thumbstick') : console.log('down on left thumbstick')
                                    dolly.position.y -= speedFactor[i] * data.axes[3];
                                    //provide haptic feedback if available in browser
                                    if (
                                        source.gamepad.hapticActuators &&
                                        source.gamepad.hapticActuators[0]
                                    ) {
                                        var pulseStrength = Math.abs(data.axes[3]);
                                        if (pulseStrength > 0.75) {
                                            pulseStrength = 0.75;
                                        }
                                        var didPulse = source.gamepad.hapticActuators[0].pulse(
                                            pulseStrength,
                                            100
                                        );
                                    }
                                } else {
                                    // (data.axes[3] > 0) ? console.log('up on right thumbstick') : console.log('down on right thumbstick')
                                    dolly.position.x -= cameraVector.x * speedFactor[i] * data.axes[3];
                                    dolly.position.z -= cameraVector.z * speedFactor[i] * data.axes[3];

                                    //provide haptic feedback if available in browser
                                    if (
                                        source.gamepad.hapticActuators &&
                                        source.gamepad.hapticActuators[0]
                                    ) {
                                        var pulseStrength = Math.abs(data.axes[2]) + Math.abs(data.axes[3]);
                                        if (pulseStrength > 0.75) {
                                            pulseStrength = 0.75;
                                        }
                                        var didPulse = source.gamepad.hapticActuators[0].pulse(
                                            pulseStrength,
                                            100
                                        );
                                    }
                                }
                                controls.update();
                            }
                        } else {
                            //axis below threshold - reset the speedFactor if it is greater than zero  or 0.025 but below our threshold
                            if (Math.abs(value) > 0.025) {
                                speedFactor[i] = 0.025;
                            }
                        }
                    });
                }
                ///store this frames data to compate with in the next frame
                prevGamePads.set(source, data);
            }
        }
    }
}

function isIterable(obj) {  //function to check if object is iterable
    // checks for null and undefined
    if (obj == null) {
        return false;
    }
    return typeof obj[Symbol.iterator] === "function";
}
*/
