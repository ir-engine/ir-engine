import { Vector3 } from "three"
import { BinaryValue } from "../../common/enums/BinaryValue"
import { isServer } from "../../common/functions/isServer"
import { Entity } from "../../ecs/classes/Entity"
import { addComponent, getComponent, hasComponent, removeComponent } from "../../ecs/functions/EntityFunctions"
import { Network } from "../../networking/classes/Network"
import { NetworkObject } from "../../networking/components/NetworkObject"
import { HaveBeenInteracted } from "../../interaction/components/HaveBeenInteractedTagComponent";
// TODO: (editObject: NetworkObjectEditInterface): void => {
export const handleInteractWithGameObject = (editObject): void => {
  const playerId = editObject.networkId;
  const [state, gameObjectId, currentFocusedPart] = editObject.values// as VehicleStateUpdateSchema;

  const gameObject: Entity = Network.instance.networkObjects[gameObjectId].component.entity;

  console.warn(gameObject);
  !hasComponent(gameObject, HaveBeenInteracted ) ? addComponent(gameObject, HaveBeenInteracted ):'';

}
