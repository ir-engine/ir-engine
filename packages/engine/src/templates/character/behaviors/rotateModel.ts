import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import {getComponent, getMutableComponent} from "../../../ecs/functions/EntityFunctions";
import { Object3DComponent } from "@xr3ngine/engine/src/common/components/Object3DComponent";
import { Entity } from "../../../ecs/classes/Entity";
import { TransformComponent } from "../../../transform/components/TransformComponent";
import { Vector3 } from "three";
import { FollowCameraComponent } from "../../../camera/components/FollowCameraComponent";
import { Input } from "../../../input/components/Input";
import { DefaultInput } from "../../shared/DefaultInput";
import { NumericalType } from "@xr3ngine/engine/src/common/types/NumericalTypes";
import { getInputData } from "../../../camera/functions/getInputData";

const defaultForwardVector = new Vector3(0, 0, 1);
const defaultUpVector = new Vector3(0, 1, 0);//when we use a standard vector3 where Z:1 - then a bug appears in which the character spins around itself

export const rotateModel: Behavior = (entity: Entity): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	if (!actor.initialized) return;
	const followerMode = getComponent(entity, FollowCameraComponent)?.mode ?? 'thirdPersonLocked'; // Camera
	const actorTransform: TransformComponent = getMutableComponent<TransformComponent>(entity, TransformComponent as any);
	const actorObject3D: Object3DComponent = getComponent<Object3DComponent>(entity, Object3DComponent);
	
	if (actorObject3D === undefined) console.warn("Object3D is undefined");
	else {
		if (followerMode === 'thirdPersonLocked') {
			
			const actorInputs = getComponent(entity, Input);	
			const inputAxes = DefaultInput.LOOKTURN_PLAYERONE;
			const inputValue = getInputData(actorInputs, inputAxes);
			
			if(inputValue){
			let theta = Math.atan2( actor.orientation.x, actor.orientation.z) * 180 / Math.PI ;
	
			theta -= inputValue[0] * 80 ;
			
			actorTransform.rotation.setFromAxisAngle(defaultUpVector, theta * (Math.PI / 180));
			actor.orientation.copy(defaultForwardVector).applyQuaternion(actorTransform.rotation);
			}
			actorTransform.rotation.setFromUnitVectors(defaultForwardVector, actor.orientation.clone().setY(0));
			
		} else {
			actorTransform.rotation.setFromUnitVectors(defaultForwardVector, actor.orientation.clone().setY(0));
		
		}
		actor.tiltContainer.rotation.z = (-actor.angularVelocity * 2.3 * actor.velocity.length());
		actor.tiltContainer.position.setY((Math.cos(Math.abs(actor.angularVelocity * 2.3 * actor.velocity.length())) / 2) - 0.5);
		
	}
};
