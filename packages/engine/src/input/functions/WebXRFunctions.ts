import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { MeshPhongMaterial, Vector3 } from 'three';
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