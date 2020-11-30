import { Behavior } from '../../../common/interfaces/Behavior';
import { Entity } from '../../../ecs/classes/Entity';
import { getComponent, getMutableComponent, hasComponent } from '../../../ecs/functions/EntityFunctions';
import { CharacterComponent } from '../components/CharacterComponent';
import { TransformComponent } from '../../../transform/components/TransformComponent';
import { rotateModel } from "./rotateModel";
import { springRotation } from "./springRotation";
import { springMovement } from "./springMovement";
import { Object3DComponent } from '../../../common/components/Object3DComponent';
import { cannonFromThreeVector } from "../../../common/functions/cannonFromThreeVector";
import { Vector3 } from 'three';
import { Network } from '../../../networking/components/Network';
import { NetworkInterpolation } from '../../../networking/components/NetworkInterpolation';
import { LocalInputReceiver } from '../../../input/components/LocalInputReceiver';
import { Vault } from '../../../networking/components/Vault';
import { calculateInterpolation, addSnapshot, createSnapshot } from '../../../networking/functions/NetworkInterpolationFunctions';
import { Engine } from '../../../ecs/classes/Engine';
import { isClient } from '../../../common/functions/isClient';

export const updateCharacter: Behavior = (entity: Entity, args = null, deltaTime) => {
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  const actorTransform = getMutableComponent<TransformComponent>(entity, TransformComponent as any);
  // actor.behaviour?.update(timeStep);
  // actor.vehicleEntryInstance?.update(timeStep);
  // console.log(this.occupyingSeat);
  // this.charState?.update(timeStep);
  if (actor.mixer) {
    actor.mixer.update(deltaTime);
  }

  if (actor.physicsEnabled) {

    // transfer localMovementDirection into velocityTarget
    actor.velocityTarget.copy(actor.localMovementDirection);




if (isClient) {
    (Network.instance.worldState.snapshot as any)?.state?.forEach(stateData => {
      if (Network.instance.networkObjects[stateData.networkId] === undefined) return;
      const networkComponent = Network.instance.networkObjects[stateData.networkId].component;
      if(networkComponent.ownerId === Network.instance.userId && hasComponent(networkComponent.entity, LocalInputReceiver)) {
        const actor = getComponent<CharacterComponent>(networkComponent.entity, CharacterComponent)



        const playerSnapshot = createSnapshot([{
           networkId: 0,
           x: actor.actorCapsule.body.position.x,
           y: actor.actorCapsule.body.position.y,
           z: actor.actorCapsule.body.position.z,
           qX: 0,
           qY: 0,
           qZ: 0,
           qW: 0
         }])
        Vault.instance.add(playerSnapshot);


        let offsetX = 0, offsetY = 0, offsetZ = 0;


        const oldPlayerSnapshot = Vault.instance.get(Network.instance.worldState.snapshot.time - NetworkInterpolation.instance.timeOffset+1000, true)

        if (oldPlayerSnapshot) {
      //    console.warn('playerSnapshot');
      //    console.warn(oldPlayerSnapshot.time - 1606631900000);
      //  const serverSnapshot = NetworkInterpolation.instance.get(playerSnapshot.time + NetworkInterpolation.instance.timeOffset, true)
        //  worldState.snapshot.time - NetworkInterpolation.instance.timeOffset, true);
      //  if (serverSnapshot) {


      //      console.warn('serverTime');
      //      console.warn(Network.instance.worldState.snapshot.time - 1606631900000);
      //      console.warn('//////////////////');

            offsetX = oldPlayerSnapshot.state[0].x - stateData.x
            offsetY = oldPlayerSnapshot.state[0].y - stateData.y
            offsetZ = oldPlayerSnapshot.state[0].z - stateData.z
      //    }
        }
        // we correct the position faster if the player moves
        const correction = 120
        // apply a step by step correction of the player's position
      //  actor.actorCapsule.body.position.set(
          actor.actorCapsule.body.position.x -= (offsetX / correction);
          actor.actorCapsule.body.position.y -= (offsetY / correction);
          actor.actorCapsule.body.position.z -= (offsetZ / correction);
      //  )


        springMovement(networkComponent.entity, null, deltaTime);
        springRotation(networkComponent.entity, null, deltaTime);
        rotateModel(networkComponent.entity);
      }
    })



    const interpolationSnapshot = calculateInterpolation('x y z quat')
    if (interpolationSnapshot === undefined)
        return console.warn("interpolationSnapshot is null");

    const { state } = interpolationSnapshot


    // Update transforms

    state.forEach(interpolationData => {
      if(!Network.instance.networkObjects[interpolationData.networkId]){
        return console.warn("Network object not found in list: ", interpolationData.networkId);
      }

      // Get network component from data
      const networkComponent = Network.instance.networkObjects[interpolationData.networkId].component;
      const transform = getMutableComponent(networkComponent.entity, TransformComponent);

      //if (hasComponent(networkComponent.entity, CharacterComponent)) {
        if (!hasComponent(networkComponent.entity, LocalInputReceiver)) {
        const actor = getMutableComponent<CharacterComponent>(networkComponent.entity, CharacterComponent as any);



          // apply the interpolated values to you game objects
          actor.actorCapsule.body.position.set(
            interpolationData.x,
            interpolationData.y,
            interpolationData.z
          );

          transform.rotation.set(
            interpolationData.qX,
            interpolationData.qY,
            interpolationData.qZ,
            interpolationData.qW
          );
          
        }
  /*    } else {
        transform.position.set(
          interpolationData.x,
          interpolationData.y,
          interpolationData.z
        );*/
    //  }
      // Apply rot to object


    });

}






    actorTransform.position.set(
      actor.actorCapsule.body.position.x,
      actor.actorCapsule.body.position.y,
      actor.actorCapsule.body.position.z
    );



    // actorTransform.position.set(
    //   actor.actorCapsule.body.interpolatedPosition.x,
    //   actor.actorCapsule.body.interpolatedPosition.y,
    //   actor.actorCapsule.body.interpolatedPosition.z
    // );




  }
  else {

    const newPos = new Vector3();
    getMutableComponent(entity, Object3DComponent).value.getWorldPosition(newPos);
    actor.actorCapsule.body.position.copy(cannonFromThreeVector(newPos));
    actor.actorCapsule.body.interpolatedPosition.copy(cannonFromThreeVector(newPos));

  }
  if (isClient && Engine.camera) {
      actor.viewVector = new Vector3(0, 0,-1).applyQuaternion(Engine.camera.quaternion);
  }
};
