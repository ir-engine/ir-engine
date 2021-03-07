import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { MeshPhongMaterial, Vector3 } from 'three';
import { GLTFLoader } from "../../assets/loaders/gltf/GLTFLoader";
import { addComponent, getComponent, removeComponent } from '../../ecs/functions/EntityFunctions';
import { XRInputReceiver } from '../components/XRInputReceiver';

let head, controllerGripLeft, controllerLeft, controllerRight, controllerGripRight, entity;


export function initializeXR(actorEntity) {
  console.log("initializing XR")

  if (!navigator || !(navigator as any).xr)
    return console.warn("Not initializing WebXR on this platform because it is not supported");

  Engine.renderer.xr.setReferenceSpaceType('local-floor');
  entity = actorEntity;
}

export function startXR() {
  if (!entity) return;

  if (Engine.xrSession === null) {
    const sessionInit = { optionalFeatures: ['local-floor', 'bounded-floor'] };
    try {
      (navigator as any).xr.requestSession("immersive-vr", sessionInit).then((session) => {
        Engine.xrSession = session;
        Engine.renderer.xr.setSession(session);

        head = Engine.renderer.xr.getCamera(Engine.camera);
        controllerLeft = Engine.renderer.xr.getController(0);
        controllerRight = Engine.renderer.xr.getController(1);
        Engine.scene.add(controllerLeft);
        Engine.scene.add(controllerRight);
        Engine.scene.add(head);

        controllerGripLeft = Engine.renderer.xr.getControllerGrip(0);
        controllerGripRight = Engine.renderer.xr.getControllerGrip(1);

        addComponent(entity, XRInputReceiver, {
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
        console.warn(getComponent(entity, XRInputReceiver));
        console.warn(controllerLeft);

        new GLTFLoader().load('../models/webxr/controllers/valve_controller_knu_1_0_right.glb', obj => {
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
        })


      });
    } catch (e) {
      console.log('Could not create VR session', e)
    }

  } else {
    removeComponent(entity, XRInputReceiver);
    Engine.xrSession.end();
    Engine.xrSession = null;
  }
}