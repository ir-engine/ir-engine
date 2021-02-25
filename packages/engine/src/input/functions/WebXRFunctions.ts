import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { MeshPhongMaterial, Vector3 } from 'three';
import { GLTFLoader } from "../../assets/loaders/gltf/GLTFLoader";
import { addComponent, getComponent, removeComponent } from '../../ecs/functions/EntityFunctions';
import { XRControllersComponent } from '../components/XRControllersComponent';

let controllerGrip1, controllerGrip2, button;

export function initControllersVR(actorEntity) {
  // controllers

  const controller1 = Engine.renderer.xr.getController(0);
  //  controller1.addEventListener( 'selectstart', (e) => {selectStart(e, 0)} );
  //  controller1.addEventListener( 'selectend', e => {onSelectEnd(e,0)} );
  Engine.scene.add(controller1);

  const controller2 = Engine.renderer.xr.getController(1);
  //  controller2.addEventListener( 'selectstart', (e) => {selectStart(e, 1)} );
  //  controller2.addEventListener( 'selectend', e => {onSelectEnd(e,1)} );
  Engine.scene.add(controller2);

  /////var controllerModelFactory = new XRControllerModelFactory();

  controllerGrip1 = Engine.renderer.xr.getControllerGrip(0);
  controllerGrip2 = Engine.renderer.xr.getControllerGrip(1);

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
    mesh.position.z = -0.08;
    const mesh2 = mesh.clone()

    //    console.warn(obj);

    mesh2.scale.multiply(new Vector3(-1, 1, 1));

    controllerGrip1.add(mesh);
    Engine.scene.add(controllerGrip1);


    controllerGrip2.add(mesh2);
    Engine.scene.add(controllerGrip2);
    console.warn('Loaded Model Controllers Done');
    //    });

    //  });

  })
}


let entity;

export function initVR(actorEntity) {
  if (!navigator || !(navigator as any).xr)
    return console.warn("Not initializing WebXR on this platform because it is not supported");

  // button = document.createElement( 'button' );
  // button.id = 'VRButton';
  // if (!(navigator as any).xr.isSessionSupported( 'immersive-vr' ))

  // Engine.renderer.xr.enabled = true;
  Engine.renderer.xr.setReferenceSpaceType('local-floor');
  entity = actorEntity;
}

function onSessionStarted(session) {
  Engine.renderer.xr.setSession(session);
}

function onSessionEnded() {

}

export function startVR() {
  if(!entity) return;
  
  if (Engine.xrSession === null) {

    const sessionInit = { optionalFeatures: ['local-floor', 'bounded-floor'] };
    //	var sessionInit = { optionalFeatures: [ "unbounded" ] };
    //	var sessionInit = { optionalFeatures:  [ "local" ] };
    try {
      (navigator as any).xr.requestSession("immersive-vr", sessionInit).then((session) => {
        Engine.xrSession = session;
        onSessionStarted(session)
        initControllersVR(entity)
      });
    } catch (e) {
      console.log('Could not create VR session', e)
    }

  } else {
    removeComponent(entity, XRControllersComponent);
    Engine.xrSession.end();
    Engine.xrSession = null;
    onSessionEnded();
  }
}