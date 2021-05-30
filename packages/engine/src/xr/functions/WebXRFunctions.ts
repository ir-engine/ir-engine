import { Engine } from "../../ecs/classes/Engine";
import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, Group, Line, LineBasicMaterial, Material, Mesh, MeshBasicMaterial, MeshPhongMaterial, Object3D, Quaternion, RingGeometry, Vector3 } from 'three';
import { getLoader } from "../../assets/functions/LoadGLTF";
// import { GLTF } from "../../assets/loaders/gltf/GLTFLoader";
import { FollowCameraComponent } from "../../camera/components/FollowCameraComponent";
import { CameraModes } from "../../camera/types/CameraModes";
import { addComponent, getComponent, getMutableComponent, hasComponent, removeComponent } from '../../ecs/functions/EntityFunctions';
import { Network } from "../../networking/classes/Network";
import { XRSystem } from "../systems/XRSystem";
import { CharacterComponent } from "../../character/components/CharacterComponent";
import { XRInputReceiver } from '../../input/components/XRInputReceiver';
import { initiateIK, stopIK } from "./IKFunctions";
import { initializeMovingState } from "../../character/animations/MovingAnimations";
import { CHARACTER_STATES } from "../../character/state/CharacterStates";
import { clearBit, setBit } from "../../common/functions/bitFunctions";
import { getBit } from "../../common/functions/bitFunctions";
import { Entity } from "../../ecs/classes/Entity";
import { ParityValue } from "../../common/enums/ParityValue";
import { Input } from "../../input/components/Input";
import { BaseInput } from "../../input/enums/BaseInput";
import { SIXDOFType } from "../../common/types/NumericalTypes";
import { EngineEvents } from "../../ecs/classes/EngineEvents";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { IKComponent } from "../../character/components/IKComponent";

let head, controllerGripLeft, controllerLeft, controllerRight, controllerGripRight;

/**
 * @author Josh Field <github.com/HexaField>
 * @returns {Promise<boolean>} returns true on success, otherwise throws error and returns false
 */

export const startXR = async (): Promise<boolean> => {

  try{

    const cameraFollow = getMutableComponent<FollowCameraComponent>(Network.instance.localClientEntity, FollowCameraComponent) as FollowCameraComponent;
    cameraFollow.mode = CameraModes.XR;
    const actor = getMutableComponent(Network.instance.localClientEntity, CharacterComponent);

    initiateIK(Network.instance.localClientEntity)

    head = Engine.xrRenderer.getCamera();
    controllerLeft = Engine.xrRenderer.getController(1);
    controllerRight = Engine.xrRenderer.getController(0);
    actor.tiltContainer.add(controllerLeft);
    actor.tiltContainer.add(controllerRight);

    Engine.scene.remove(Engine.camera);
    actor.tiltContainer.add(Engine.camera);
    

    // obviously unfinished
    [controllerLeft, controllerRight].forEach((controller) => {
/*
      controller.addEventListener('select', (ev) => {})
      controller.addEventListener('selectstart', (ev) => {})
      controller.addEventListener('selectend', (ev) => {})
      controller.addEventListener('squeeze', (ev) => {})
      controller.addEventListener('squeezestart', (ev) => {})
      controller.addEventListener('squeezeend', (ev) => {})
*/
      controller.addEventListener('connected', (ev) => {
        if(controller.targetRay) {
          controller.targetRay.visible = true;
        } else {
          const targetRay = createController(ev.data);
          controller.add(targetRay);
          controller.targetRay = targetRay;
        }
      })

      controller.addEventListener('disconnected', (ev) => {
        controller.targetRay.visible = false;
      })

    })

    controllerGripLeft = Engine.xrRenderer.getControllerGrip(1);
    controllerGripRight = Engine.xrRenderer.getControllerGrip(0);

    addComponent(Network.instance.localClientEntity, XRInputReceiver, {
      head: head,
      controllerLeft: controllerLeft,
      controllerRight: controllerRight,
      controllerGripLeft: controllerGripLeft,
      controllerGripRight: controllerGripRight
    })

    const obj: any = await new Promise((resolve) => { getLoader().load('/models/webxr/controllers/valve_controller_knu_1_0_right.glb', obj => { resolve(obj) }, console.warn, console.error)});
    const controller3DModel = obj.scene.children[2] as any;

    const controllerMeshRight = controller3DModel.clone();
    const controllerMeshLeft = controller3DModel.clone();

    controllerMeshLeft.scale.multiply(new Vector3(-1, 1, 1));

    controllerMeshRight.material = new MeshPhongMaterial();
    controllerMeshLeft.material = new MeshPhongMaterial();

    controllerMeshRight.position.z = -0.12;
    controllerMeshLeft.position.z = -0.12;

    controllerGripRight.add(controllerMeshRight);
    controllerGripLeft.add(controllerMeshLeft);

    
    actor.tiltContainer.add(controllerGripRight);
    actor.tiltContainer.add(controllerGripLeft);

    // console.log('Loaded Model Controllers Done');

    return true;
  } catch (e) {
    console.error('Could not create VR session', e)
    return false;
  }
}

/**
 * @author Josh Field <github.com/HexaField>
 * @returns {void}
 */

export const endXR = (): void => {
  removeComponent(Network.instance.localClientEntity, XRInputReceiver);
  const cameraFollow = getMutableComponent<FollowCameraComponent>(Network.instance.localClientEntity, FollowCameraComponent) as FollowCameraComponent;
  cameraFollow.mode = CameraModes.ThirdPerson;
  Engine.xrSession.end();
  Engine.xrSession = null;
  // Engine.renderer.setAnimationLoop(null);
  const actor = getMutableComponent(Network.instance.localClientEntity, CharacterComponent);
  Engine.scene.add(Engine.camera);
  stopIK(Network.instance.localClientEntity)
  initializeMovingState(Network.instance.localClientEntity)

}

// pointer taken from https://github.com/mrdoob/three.js/blob/master/examples/webxr_vr_ballshooter.html
const createController = (data) => {
  let geometry, material;
  switch ( data.targetRayMode ) {
    case 'tracked-pointer':
      geometry = new BufferGeometry();
      geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
      geometry.setAttribute( 'color', new Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );
      geometry.setAttribute( 'alpha', new Float32BufferAttribute( [1, 0 ], 1 ) );
      material = new LineBasicMaterial( { vertexColors: true, blending: AdditiveBlending } );
      return new Line( geometry, material );

    case 'gaze':
      geometry = new RingGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
      material = new MeshBasicMaterial( { opacity: 0.5, transparent: true } );
      return new Mesh( geometry, material );
  }
};

/**
 * @author Josh Field <github.com/HexaField>
 * @returns {boolean}
 */

export const isInXR = (entity: Entity) => {
  return hasComponent(entity, IKComponent);
}

const vec3 = new Vector3();
const quat = new Quaternion();
const forward = new Vector3(0, 0, -1);

/**
 * Gets the hand position in world space
 * @author Josh Field <github.com/HexaField>
 * @param entity the player entity
 * @param hand which hand to get
 * @returns {Vector3}
 */

export const getHandPosition = (entity: Entity, hand: ParityValue = ParityValue.NONE): Vector3 => {
  const actor = getComponent(entity, CharacterComponent);
  const transform = getComponent(entity, TransformComponent);
  if(isInXR(entity)) {
    const input = getComponent(entity, Input).data.get(hand === ParityValue.LEFT ? BaseInput.XR_LEFT_HAND : BaseInput.XR_RIGHT_HAND)
    if(input) {
      const sixdof = input.value as SIXDOFType;
      return vec3.set(sixdof.x, sixdof.y, sixdof.z).applyMatrix4(actor.tiltContainer.matrixWorld);
    }
  }
  // TODO: once IK rig is fixed
  // const ikComponent = getComponent(entity, IKComponent);
  // if(ikComponent && ikComponent.avatarIKRig) {
  //   const rigHand: Object3D = hand === ParityValue.LEFT ? ikComponent.avatarIKRig.poseManager.vrTransforms.leftHand : ikComponent.avatarIKRig.poseManager.vrTransforms.rightHand;
  //   if(rigHand) {
  //     return rigHand.getWorldPosition(vec3).add(actor.tiltContainer.position);
  //   }
  // }
  // TODO: replace (-0.5, 0, 0) with animation hand position once new animation rig is in
  return vec3.set(-0.5, 0, 0).applyQuaternion(actor.tiltContainer.quaternion).add(transform.position);
}

/**
 * Gets the hand rotation in world space
 * @author Josh Field <github.com/HexaField>
 * @param entity the player entity
 * @param hand which hand to get
 * @returns {Quaternion}
 */

export const getHandRotation = (entity: Entity, hand: ParityValue = ParityValue.NONE): Quaternion => {
  const actor = getComponent(entity, CharacterComponent);
  if(isInXR(entity)) {
    const transform = getComponent(entity, TransformComponent);
    const input = getComponent(entity, Input).data.get(hand === ParityValue.LEFT ? BaseInput.XR_LEFT_HAND : BaseInput.XR_RIGHT_HAND)
    if(input) {
      const sixdof = input.value as SIXDOFType;
      return quat.set(sixdof.qX, sixdof.qY, sixdof.qZ, sixdof.qW).premultiply(transform.rotation)
    }
  }
  // TODO: once IK rig is fixed
  // const ikComponent = getComponent(entity, IKComponent);
  // if(ikComponent && ikComponent.avatarIKRig) {
  //   const rigHand: Object3D = hand === ParityValue.LEFT ? ikComponent.avatarIKRig.poseManager.vrTransforms.leftHand : ikComponent.avatarIKRig.poseManager.vrTransforms.rightHand;
  //   if(rigHand) {
  //     return rigHand.getWorldQuaternion(quat)
  //   }
  // }
  return quat.setFromUnitVectors(forward, actor.viewVector)
}

/**
 * Gets the hand transform in world space
 * @author Josh Field <github.com/HexaField>
 * @param entity the player entity
 * @param hand which hand to get
 * @returns { position: Vector3, rotation: Quaternion }
 */

export const getHandTransform = (entity: Entity, hand: ParityValue = ParityValue.NONE): { position: Vector3, rotation: Quaternion } => {
  const actor = getComponent(entity, CharacterComponent);
  const transform = getComponent(entity, TransformComponent);
  if(isInXR(entity)) {
    console.log('isInXR')
    const input = getComponent(entity, Input).data.get(hand === ParityValue.LEFT ? BaseInput.XR_LEFT_HAND : BaseInput.XR_RIGHT_HAND)
    if(input) {
      const sixdof = input.value as SIXDOFType;
      return { 
        position: vec3.set(sixdof.x, sixdof.y, sixdof.z).applyMatrix4(actor.tiltContainer.matrixWorld),
        rotation: quat.set(sixdof.qX, sixdof.qY, sixdof.qZ, sixdof.qW).premultiply(transform.rotation)
      }
    }
  }
  // TODO: once IK rig is fixed
  // const ikComponent = getComponent(entity, IKComponent);
  // if(ikComponent && ikComponent.avatarIKRig) {
  //   const rigHand: Object3D = hand === ParityValue.LEFT ? ikComponent.avatarIKRig.poseManager.vrTransforms.leftHand : ikComponent.avatarIKRig.poseManager.vrTransforms.rightHand;
  //   if(rigHand) {
  //     return { 
  //       position: rigHand.getWorldPosition(vec3).add(actor.tiltContainer.position),
  //       rotation: rigHand.getWorldQuaternion(quat)
  //     }
  //   }
  // }
  return {
    // TODO: replace (-0.5, 0, 0) with animation hand position once new animation rig is in
    position: vec3.set(-0.5, 0, 0).applyQuaternion(actor.tiltContainer.quaternion).add(transform.position),
    rotation: quat.setFromUnitVectors(forward, actor.viewVector)
  }
}