import { Engine } from "../../ecs/classes/Engine";
import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, Group, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, MeshPhongMaterial, Object3D, Quaternion, RingGeometry, Vector3 } from 'three';
import { getLoader } from "../../assets/functions/LoadGLTF";
import { FollowCameraComponent } from "../../camera/components/FollowCameraComponent";
import { CameraModes } from "../../camera/types/CameraModes";
import { addComponent, getComponent, getMutableComponent, hasComponent, removeComponent } from '../../ecs/functions/EntityFunctions';
import { Network } from "../../networking/classes/Network";
import { CharacterComponent } from "../../character/components/CharacterComponent";
import { XRInputReceiver } from '../../input/components/XRInputReceiver';
import { initiateIK, stopIK } from "./IKFunctions";
import { initializeMovingState } from "../../character/animations/MovingAnimations";
import { Entity } from "../../ecs/classes/Entity";
import { ParityValue } from "../../common/enums/ParityValue";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { IKComponent } from "../../character/components/IKComponent";
import { IKRigComponent } from "../../character/components/IKRigComponent";
import { Input } from "../../input/components/Input";
import { BaseInput } from "../../input/enums/BaseInput";
import { SIXDOFType } from "../../common/types/NumericalTypes";
import { isClient } from "../../common/functions/isClient";
import { isEntityLocalClient } from "../../networking/functions/isEntityLocalClient";

/**
 * @author Josh Field <github.com/HexaField>
 * @returns {Promise<boolean>} returns true on success, otherwise throws error and returns false
 */

const rotate180onY = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI);

export const startXR = async (): Promise<boolean> => {

  try {

    const cameraFollow = getMutableComponent<FollowCameraComponent>(Network.instance.localClientEntity, FollowCameraComponent) as FollowCameraComponent;
    cameraFollow.mode = CameraModes.XR;
    const actor = getMutableComponent(Network.instance.localClientEntity, CharacterComponent);

    initiateIK(Network.instance.localClientEntity)

    const controllerLeft = Engine.xrRenderer.getController(1);
    const controllerRight = Engine.xrRenderer.getController(0);
    const controllerGripLeft = Engine.xrRenderer.getControllerGrip(1);
    const controllerGripRight = Engine.xrRenderer.getControllerGrip(0);
    const xrGroup = new Group();
    xrGroup.add(controllerLeft, controllerRight, controllerGripRight, controllerGripLeft);
    xrGroup.applyQuaternion(rotate180onY);
    actor.tiltContainer.add(xrGroup);

    const head = Engine.xrRenderer.getCamera();
    Engine.scene.remove(Engine.camera);
    const camGroup = new Group();
    camGroup.add(Engine.camera);
    camGroup.applyQuaternion(rotate180onY)
    actor.tiltContainer.add(camGroup);

    addComponent(Network.instance.localClientEntity, XRInputReceiver, {
      head: head as any,
      headGroup: camGroup,
      controllerLeft,
      controllerRight,
      controllerGripLeft,
      controllerGripRight
    });

    // Add our controller models & pointer lines
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

    getLoader().load('/models/webxr/controllers/valve_controller_knu_1_0_right.glb', (obj) => { 
      const controller3DModel = obj.scene.children[2] as any;
      console.log(obj)
      
      const controllerMeshRight = controller3DModel.clone();
      const controllerMeshLeft = controller3DModel.clone();
      
      controllerMeshLeft.scale.multiply(new Vector3(-1, 1, 1));
      
      controllerMeshRight.material = new MeshPhongMaterial();
      controllerMeshLeft.material = new MeshPhongMaterial();
      
      controllerMeshRight.position.z = -0.12;
      controllerMeshLeft.position.z = -0.12;
      
      controllerGripRight.add(controllerMeshRight);
      controllerGripLeft.add(controllerMeshLeft);
    }, console.warn, console.error);

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
  const ikRigComponent = getComponent(entity, IKRigComponent);
  if(ikRigComponent && ikRigComponent.avatarIKRig) {
    const rigHand: Object3D = hand === ParityValue.LEFT ? ikRigComponent.avatarIKRig.poseManager.vrTransforms.leftHand : ikRigComponent.avatarIKRig.poseManager.vrTransforms.rightHand;
    if(rigHand) {
      return rigHand.getWorldPosition(vec3);
    }
  }
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
  const ikRigComponent = getComponent(entity, IKRigComponent);
  if(ikRigComponent && ikRigComponent.avatarIKRig) {
    const rigHand: Object3D = hand === ParityValue.LEFT ? ikRigComponent.avatarIKRig.poseManager.vrTransforms.leftHand : ikRigComponent.avatarIKRig.poseManager.vrTransforms.rightHand;
    if(rigHand) {
      return rigHand.getWorldQuaternion(quat)
    }
  }
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
  // quick fix until ik is fixed
  if(isEntityLocalClient(entity)) {
    const inputSources = getComponent(Network.instance.localClientEntity, XRInputReceiver);
    if(inputSources) {
      const rigHand: Object3D = hand === ParityValue.LEFT ? inputSources.controllerLeft : inputSources.controllerRight;
      if(rigHand) {
        return { 
          position: rigHand.getWorldPosition(vec3),
          rotation: rigHand.getWorldQuaternion(quat)
        }
      }
    }
  } else {
    if(isInXR(entity)) {
      const input = getComponent(entity, Input).data.get(hand === ParityValue.LEFT ? BaseInput.XR_LEFT_HAND : BaseInput.XR_RIGHT_HAND)
      if(input) {
        const sixdof = input.value as SIXDOFType;
        return { 
          position: vec3.set(sixdof.x, sixdof.y, sixdof.z).applyMatrix4(actor.tiltContainer.matrixWorld),
          rotation: quat.set(sixdof.qX, sixdof.qY, sixdof.qZ, sixdof.qW).premultiply(transform.rotation)
        }
      }
    }
  }
  const ikRigComponent = getComponent(entity, IKRigComponent);
  if(ikRigComponent && ikRigComponent.avatarIKRig) {
    const rigHand: Object3D = hand === ParityValue.LEFT ? ikRigComponent.avatarIKRig.poseManager.vrTransforms.leftHand : ikRigComponent.avatarIKRig.poseManager.vrTransforms.rightHand;
    if(rigHand) {
      return { 
        position: rigHand.getWorldPosition(vec3),
        rotation: rigHand.getWorldQuaternion(quat)
      }
    }
  }
  return {
    // TODO: replace (-0.5, 0, 0) with animation hand position once new animation rig is in
    position: vec3.set(-0.5, 0, 0).applyQuaternion(actor.tiltContainer.quaternion).add(transform.position),
    rotation: quat.setFromUnitVectors(forward, actor.viewVector)
  }
}