import { Entity } from '../../ecs/classes/Entity';
import { Network } from '../../networking/classes/Network';
import { NetworkPrefab } from '../../networking/interfaces/NetworkPrefab';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { ColliderComponent } from '../../physics/components/ColliderComponent';
import { RigidBodyComponent } from '../../physics/components/RigidBody';
import { initializeNetworkObject } from '../../networking/functions/initializeNetworkObject';
import { PrefabType } from '../../networking/templates/PrefabType';
import { AssetLoader } from '../../assets/classes/AssetLoader';
import { Engine } from '../../ecs/classes/Engine';
import { NetworkObject } from '../../networking/components/NetworkObject';
import { SceneTagComponent, VisibleTagComponent } from '../../scene/components/Object3DTagComponents';
import { Object3DComponent } from '../../scene/components/Object3DComponent';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { addComponent, getComponent, getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { CollisionGroups, DefaultCollisionMask } from '../../physics/enums/CollisionGroups';
import { InterpolationComponent } from '../../physics/components/InterpolationComponent';
import { GameObject } from "../../game/components/GameObject";
import { UserControlledColliderComponent } from '../../physics/components/UserControllerObjectComponent';
import { Interactable } from "../../interaction/components/Interactable";
import { Body, BodyType, createShapeFromConfig, Shape, SHAPES } from 'three-physx';
import { addBall } from '../../game/templates/Golf/behaviors/addBall'
/**
* @author HydraFire <github.com/HydraFire>
 */
export function spawnNetworkRigidBody( args:{ url: string, game: string, role: string, networkId: any, uniqueId: any }) {
  console.warn('spawnNetworkRigidBody');
  const entity = new Entity();
  const networkObject = addComponent(entity, NetworkObject, { ownerId: 'server', networkId: args.networkId, uniqueId: args.uniqueId } );
  addComponent(entity, TransformComponent);

  AssetLoader.load({
    url: Engine.publicPath + args.url,
    entity: entity,
  }, (group) => {

    Network.instance.networkObjects[args.networkId] = {
      ownerId: 'server',
      prefabType: PrefabType.RigidBody,
      component: networkObject,
      uniqueId: args.uniqueId
    };

    addComponent(entity, Object3DComponent, { value: group });
    addComponent(entity, SceneTagComponent);
    addComponent(entity, VisibleTagComponent);



    const body = addBall();
    addComponent(entity, ColliderComponent, { body, bodytype: BodyType.DYNAMIC });
    addComponent(entity, GameObject, { game: args.game, role: args.role, uuid: args.uniqueId});
    addComponent(entity, InterpolationComponent );
    //addComponent(entity, UserControlledColliderComponent, { ownerNetworkId: args.ownerId });
    console.warn(entity);
    });
}


export function createNetworkRigidBody( args:{ parameters?: any, spawn?: any, networkId?: string | number, uniqueId: string, entity?: Entity, ownerId?: string }) {
  if (args.parameters === undefined) {

    Network.instance.networkObjects[args.networkId] = {
      ownerId: 'server',
      prefabType: PrefabType.RigidBody,
      component: null,
      uniqueId: args.uniqueId
    };

  } else {
  //  console.warn(args.spawn);
    initializeNetworkObject({
      entity: args.entity,
      prefabType: PrefabType.RigidBody,
      uniqueId: args.uniqueId,
      ownerId: 'server',//args.ownerId,
      spawn: {
        game: args.spawn.game,
        role: args.spawn.role,
        url: args.spawn.url,
      },
      override: {
        networkComponents: [
          {
            type: ColliderComponent,
            data: {
              body: args.parameters.body,
              bodytype:  args.parameters.bodytype,
              type: args.parameters.type,
              position: args.parameters.position,
              quaternion: args.parameters.quaternion,
              scale: args.parameters.scale,
              mesh: args.parameters.mesh,
              vertices: args.parameters.vertices,
              indices: args.parameters.indices,
              mass: args.parameters.mass
            }
          }
        ]
      }
    });

  }
}
// Prefab is a pattern for creating an entity and component collection as a prototype
export const NetworkRigidBody: NetworkPrefab = {
  // These will be created for all players on the network
  networkComponents: [
    // Transform system applies values from transform component to three.js object (position, rotation, etc)
    { type: TransformComponent },
    { type: ColliderComponent },
    { type: RigidBodyComponent }
    // Local player input mapped to behaviors in the input map
  ],
  // These are only created for the local player who owns this prefab
  localClientComponents: [],
  clientComponents: [],
  serverComponents: [],
  onAfterCreate: [],
  onBeforeDestroy: []
};
