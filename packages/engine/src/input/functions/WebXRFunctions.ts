import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, MeshPhongMaterial, RingGeometry, Vector3 } from 'three';
import { getLoader } from "../../assets/functions/LoadGLTF";
import { addComponent, getComponent, removeComponent } from '../../ecs/functions/EntityFunctions';
import { XRInputReceiver } from '../components/XRInputReceiver';
import { EntityActionSystem } from "../systems/EntityActionSystem";

let head, controllerGripLeft, controllerLeft, controllerRight, controllerGripRight;

export const startXR = async () => {

  try{

    head = Engine.renderer.xr.getCamera(Engine.camera);
    controllerLeft = Engine.renderer.xr.getController(0);
    controllerRight = Engine.renderer.xr.getController(1);
    Engine.scene.add(controllerLeft);
    Engine.scene.add(controllerRight);
    // Engine.scene.add(head);

    // obviously unfinished
    [controllerLeft, controllerRight].forEach((controller) => {

      controller.addEventListener('select', (ev) => {})
      controller.addEventListener('selectstart', (ev) => {})
      controller.addEventListener('selectend', (ev) => {})
      controller.addEventListener('squeeze', (ev) => {})
      controller.addEventListener('squeezestart', (ev) => {})
      controller.addEventListener('squeezeend', (ev) => {})

      controller.addEventListener('connected', (ev) => {
        controller.add(createController(ev.data));
      })

    })

    controllerGripLeft = Engine.renderer.xr.getControllerGrip(0);
    controllerGripRight = Engine.renderer.xr.getControllerGrip(1);

    addComponent(EntityActionSystem.inputReceiverEntity, XRInputReceiver, {
      headPosition: head.position,
      headRotation: head.rotation,
      controllerLeft: controllerLeft,
      controllerRight: controllerRight,
      controllerPositionLeft: controllerLeft.position,
      controllerPositionRight: controllerRight.position,
      controllerRotationLeft: controllerLeft.quaternion,
      controllerRotationRight: controllerRight.quaternion,
      controllerGripLeft: controllerGripLeft,
      controllerGripRight: controllerGripRight
    })

    console.warn(getComponent(EntityActionSystem.inputReceiverEntity, XRInputReceiver));
    console.warn(controllerLeft);

    getLoader().load('/models/webxr/controllers/valve_controller_knu_1_0_right.glb', obj => {
      const controllerMeshLeft = obj.scene.children[2] as any;
      controllerMeshLeft.material = new MeshPhongMaterial()
      controllerMeshLeft.position.z = -0.08;
      const controllerMeshRight = controllerMeshLeft.clone()

      controllerMeshRight.scale.multiply(new Vector3(-1, 1, 1));

      controllerGripLeft.add(controllerMeshLeft);
      Engine.scene.add(controllerGripLeft);

      controllerGripRight.add(controllerMeshRight);
      Engine.scene.add(controllerGripRight);

      console.warn('Loaded Model Controllers Done');
    }, console.warn, console.error)
    
    return true;
  } catch (e) {
    console.log('Could not create VR session', e)
    return false;
  }
}

export const endXR = () => {
  if(Engine.xrSession) {
    removeComponent(EntityActionSystem.inputReceiverEntity, XRInputReceiver);
    Engine.xrSession.end();
    Engine.xrSession = null;
  }
}

// pointer taken from https://github.com/mrdoob/three.js/blob/master/examples/webxr_vr_ballshooter.html
const createController = (data) => {
  let geometry, material;
  switch ( data.targetRayMode ) {
    case 'tracked-pointer':
      geometry = new BufferGeometry();
      geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
      geometry.setAttribute( 'color', new Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );
      material = new LineBasicMaterial( { vertexColors: true, blending: AdditiveBlending } );
      return new Line( geometry, material );

    case 'gaze':
      geometry = new RingGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
      material = new MeshBasicMaterial( { opacity: 0.5, transparent: true } );
      return new Mesh( geometry, material );
  }
};