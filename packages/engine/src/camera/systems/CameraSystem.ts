import { getMutableComponent } from "@xr3ngine/engine/src/ecs/functions/EntityFunctions";
import { Input } from "@xr3ngine/engine/src/input/components/Input";
import { Matrix4, Quaternion, Vector3 } from "three";
import { addObject3DComponent } from '../../scene/behaviors/addObject3DComponent';
import { CameraTagComponent } from '../../scene/components/Object3DTagComponents';
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { isClient } from '../../common/functions/isClient';
import { isMobileOrTablet } from "../../common/functions/isMobile";
import { NumericalType } from "../../common/types/NumericalTypes";
import { Engine } from '../../ecs/classes/Engine';
import { System } from '../../ecs/classes/System';
import {
  addComponent, createEntity, getComponent, hasComponent
} from '../../ecs/functions/EntityFunctions';
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { BaseInput } from '@xr3ngine/engine/src/input/enums/BaseInput';
import { DesiredTransformComponent } from '../../transform/components/DesiredTransformComponent';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { CameraComponent } from '../components/CameraComponent';
import { FollowCameraComponent } from '../components/FollowCameraComponent';
import { CameraModes } from "../types/CameraModes";

const forwardVector = new Vector3(0, 0, 1);
let direction = new Vector3();
const upVector = new Vector3(0, 1, 0);
const empty = new Vector3();
const PI_2Deg = Math.PI / 180;
const mx = new Matrix4();
const vec3 = new Vector3();
const isMobile = isMobileOrTablet()
const sensitivity = isMobile ? 60 : 100 // eventually this will come from some settings somewhere

/**
 * Get Input data from the device.
 * 
 * @param inputComponent Input component which is holding input data.
 * @param inputAxes Axes of the input.
 * @param forceRefresh
 * 
 * @returns Input value from input component.
 */
const emptyInputValue = [0, 0] as NumericalType;

const getInputData = (inputComponent: Input, inputAxes: number ): NumericalType => {
    if (!inputComponent?.data.has(inputAxes)) return emptyInputValue;
      const inputData = inputComponent.data.get(inputAxes);
      const inputValue = inputData.value;

      if (inputData.lifecycleState === LifecycleValue.ENDED ||
        (inputData.lifecycleState === LifecycleValue.UNCHANGED))
        return emptyInputValue;

      return inputValue;
  }


/** System class which provides methods for Camera system. */
export class CameraSystem extends System {
  /** Constructs camera system. */
  constructor() {
    super();
    const cameraEntity = createEntity();
    addComponent(cameraEntity, CameraComponent );
    addComponent(cameraEntity, CameraTagComponent );
    addObject3DComponent(cameraEntity, { obj3d: Engine.camera });
    addComponent(cameraEntity, TransformComponent);
    addComponent(cameraEntity, DesiredTransformComponent);
  }

  /**
   * Execute the camera system for different events of queries.\
   * Called each frame by default.
   *
   * @param delta time since last frame.
   */
  execute(delta: number): void {
    this.queryResults.followCameraComponent.added?.forEach(entity => {
      CameraComponent.instance.followTarget = entity;
    });

    this.queryResults.cameraComponent.all?.forEach(entity => {
      if (!isClient) return;
      const cam = getComponent(entity, CameraComponent) as CameraComponent;
      if (!!cam.followTarget && hasComponent(cam.followTarget, FollowCameraComponent)) {

        const cameraDesiredTransform: DesiredTransformComponent = getMutableComponent(entity, DesiredTransformComponent) as DesiredTransformComponent; // Camera
        if (!cameraDesiredTransform.position) {
          cameraDesiredTransform.position = new Vector3();
        }
        if (!cameraDesiredTransform.rotation) {
          cameraDesiredTransform.rotation = new Quaternion();
        }
        const actor: CharacterComponent = getMutableComponent<CharacterComponent>(cam.followTarget, CharacterComponent as any);
        const actorTransform = getMutableComponent(cam.followTarget, TransformComponent);
      
        const inputComponent = getComponent(cam.followTarget, Input) as Input;
        const cameraFollow = getMutableComponent<FollowCameraComponent>(cam.followTarget, FollowCameraComponent) as FollowCameraComponent;
      
        // this is for future integration of MMO style pointer lock controls
        // let inputAxes;
        // if (cameraFollow.mode === CameraModes.FirstPerson || cameraFollow.mode === CameraModes.ShoulderCam) {
        //   inputAxes = BaseInput.MOUSE_MOVEMENT;
        // } else {
          const inputAxes = BaseInput.LOOKTURN_PLAYERONE;
        // }
        const inputValue = getInputData(inputComponent, inputAxes)
        
        if(cameraFollow.locked) {
          cameraFollow.theta = Math.atan2(actor.orientation.x, actor.orientation.z) * 180 / Math.PI + 180
        }
        cameraFollow.theta -= inputValue[0] * sensitivity;
        cameraFollow.theta %= 360;
        
        cameraFollow.phi -= inputValue[1] * sensitivity;
        cameraFollow.phi = Math.min(85, Math.max(-85, cameraFollow.phi));
      
        if(cameraFollow.locked || cameraFollow.mode === CameraModes.FirstPerson) {
          actorTransform.rotation.setFromAxisAngle(upVector, (cameraFollow.theta - 180) * (Math.PI / 180));
          actor.orientation.copy(forwardVector).applyQuaternion(actorTransform.rotation);
          actorTransform.rotation.setFromUnitVectors(forwardVector, actor.orientation.clone().setY(0));
        }
      
        cameraDesiredTransform.rotationRate = isMobile || cameraFollow.mode === CameraModes.FirstPerson ? 5 : 3.5
        cameraDesiredTransform.positionRate = isMobile || cameraFollow.mode === CameraModes.FirstPerson ? 3.5 : 2
      
        let camDist = cameraFollow.distance;
        if (cameraFollow.mode === CameraModes.FirstPerson) camDist = 0.01;
        else if (cameraFollow.mode === CameraModes.ShoulderCam) camDist = cameraFollow.minDistance;
        else if (cameraFollow.mode === CameraModes.TopDown) camDist = cameraFollow.maxDistance;
      
        // TODO: add a raycast to limit camDist
        
        const phi = cameraFollow.mode === CameraModes.TopDown ? 85 : cameraFollow.phi;
      
        const shoulderOffsetWorld = cameraFollow.offset.clone().applyQuaternion(actor.tiltContainer.quaternion);
        const targetPosition = actor.tiltContainer.getWorldPosition(vec3).add(shoulderOffsetWorld);
        
        cameraDesiredTransform.position.set(
            targetPosition.x + camDist * Math.sin(cameraFollow.theta * PI_2Deg) * Math.cos(phi * PI_2Deg),
            targetPosition.y + camDist * Math.sin(phi * PI_2Deg),
            targetPosition.z + camDist * Math.cos(cameraFollow.theta * PI_2Deg) * Math.cos(phi * PI_2Deg)
        );
      
        direction.copy(cameraDesiredTransform.position);
        direction = direction.sub(targetPosition).normalize();
        
        mx.lookAt(direction, empty, upVector);
        cameraDesiredTransform.rotation.setFromRotationMatrix(mx);
      
        // for pointer lock controls
        // if(cameraFollow.mode === CameraModes.FirstPerson || cameraFollow.mode === CameraModes.ShoulderCam) {
        //     cameraTransform.rotation.copy(cameraDesiredTransform.rotation);
        // }
      
        if (cameraFollow.mode === CameraModes.FirstPerson) {
          cameraDesiredTransform.position.copy(targetPosition);
        }

      }
    });

    this.queryResults.cameraComponent.changed?.forEach(entity => {
      // applySettingsToCamera(entity)
    });

  }
}

/**
 * Queries must have components attribute which defines the list of components
 */
CameraSystem.queries = {
  cameraComponent: {
    components: [CameraComponent, TransformComponent],
    listen: {
      added: true,
      changed: true
    }
  },
  followCameraComponent: {
    components: [ FollowCameraComponent, TransformComponent ],
    listen: {
      added: true,
      changed: true
    }
  }


};
