import { Entity } from "../../../../ecs/classes/Entity";
import { Network } from "../../../../networking/classes/Network"
import { ClientNetworkStateSystem } from "../../../../networking/systems/ClientNetworkStateSystem"
import { getGame } from "../../../functions/functions";
import { GolfPrefabTypes } from "../GolfGameConstants"
import { getComponent, getMutableComponent } from "../../../../ecs/functions/EntityFunctions";
import { Input } from "../../../../input/components/Input";
import { GamepadButtons } from "../../../../input/enums/InputEnums";
import { NetworkObject } from "../../../../networking/components/NetworkObject";
import { GamePlayer } from "../../../components/GamePlayer";
import { getGameFromName } from "../../../functions/functions";
import { ArrowHelper, Color, MathUtils, Quaternion, Vector3 } from "three";
import { ColliderComponent } from "../../../../physics/components/ColliderComponent";
import { TransformComponent } from "../../../../transform/components/TransformComponent";
import { Engine } from "../../../../ecs/classes/Engine";

const vector0 = new Vector3();
const vector1 = new Vector3();
const hitAdvanceFactor = 4;
const clubPowerMultiplier = 5;
const leftTurnQuat = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 16)
const rightTurnQuat = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI / 16)

const hitBall = (entityBall: Entity, velocity: Vector3) => {
  console.log(velocity)
  const collider = getMutableComponent(entityBall, ColliderComponent);
  const velocityMultiplier = clubPowerMultiplier * 1000;

  vector0.copy(velocity).multiplyScalar(hitAdvanceFactor).multiplyScalar(0.5);

  // lock to XZ plane if we disable chip shots
  // if(!golfClubComponent.canDoChipShots) {
  vector0.y = 0;
  // }

  // teleport ball in front of club a little bit
  collider.body.updateTransform({
    translation: {
      x: collider.body.transform.translation.x + vector0.x,
      y: collider.body.transform.translation.y + vector0.y,
      z: collider.body.transform.translation.z + vector0.z,
    }
  });
  vector1.copy(velocity).multiplyScalar(velocityMultiplier).multiplyScalar(0.5);
  // vector1.copy(vec3).multiplyScalar(velocityMultiplier);
  // if(!golfClubComponent.canDoChipShots) {
  vector1.y = 0;
  // }

  collider.body.addForce(vector1);
}

export const setupOfflineDebug = (entityPlayer: Entity) => {

  if (Network.instance.transport) return;

  const game = getGame(entityPlayer);

  const tees = Object.entries(game.gameObjects).filter(([role, entity]) => {
    return role.substring(0, 7) === 'GolfTee';
  }).map(([role, entity]) => {
    return entity
  }).flat()

  let currentTee = 0

  const holes = Object.entries(game.gameObjects).filter(([role, entity]) => {
    return role.substring(0, 8) === 'GolfHole';
  }).map(([role, entity]) => {
    return entity
  }).flat()

  const clubUuid = MathUtils.generateUUID()

  const clubCreateObjectProps = {
    networkId: 2,
    ownerId: Network.instance.userId,
    uniqueId: clubUuid,
    prefabType: GolfPrefabTypes.Club,
    parameters: {
      gameName: game.name,
      role: 'GolfClub',
      uuid: clubUuid,
      ownerNetworkId: 1
    }
  }

  const ballUuid = MathUtils.generateUUID()

  const ballCreateObjectProps = {
    networkId: 3,
    ownerId: Network.instance.userId,
    uniqueId: ballUuid,
    prefabType: GolfPrefabTypes.Ball,
    parameters: {
      gameName: game.name,
      role: 'GolfBall',
      spawnPosition: new Vector3(0, 0, 0),
      uuid: ballUuid,
      ownerNetworkId: 1
    }
  }

  // Spawn the club and ball
  ClientNetworkStateSystem.instance.receivedServerWorldState.push({
    clientsConnected: [],
    clientsDisconnected: [],
    createObjects: [clubCreateObjectProps, ballCreateObjectProps],
    editObjects: [],
    destroyObjects: [],
    gameState: [],
    gameStateActions: [],
  })

  let arrowLength = 1
  const arrow = new ArrowHelper(new Vector3(), new Vector3(0, 0, 1), 0.5, 0xff00ff)
  const dir = new Vector3(0, 0, 1)
  Engine.scene.add(arrow)

  // @todo: see if this can be done via update loop instead
  setInterval(() => {
    const ballEntity = game.gameObjects['GolfBall'].find((e) => getComponent(e, NetworkObject)?.uniqueId === ballUuid)
    const ballPosition = getComponent(ballEntity, TransformComponent).position
    arrow.position.copy(ballPosition)
    arrow.setDirection(dir)
    arrow.setLength(arrowLength)
  }, 1000 / 60)

  const moveBall = () => {
    const teePosition = getComponent(tees[currentTee], TransformComponent).position
    const ballEntity = game.gameObjects['GolfBall'].find((e) => getComponent(e, NetworkObject)?.uniqueId === ballUuid)
    const collider = getComponent(ballEntity, ColliderComponent)
    collider.body.updateTransform({
      translation: teePosition
    })
  }

  const debugInputs = {
    next: 180,
    previous: 181,
    morePower: 182,
    lessPower: 183,
    rotateLeft: 184,
    rotateRight: 185,
    hit: 186,
  }


  const inputs = getComponent(entityPlayer, Input)

  // override the default mapping and behavior of input schema and interact
  inputs.schema.inputMap.set(' ', debugInputs.hit);

  inputs.schema.inputMap.set('z', debugInputs.previous);
  inputs.schema.inputMap.set('c', debugInputs.next);
  inputs.schema.inputMap.set('ArrowLeft'.toLowerCase(), debugInputs.rotateLeft);
  inputs.schema.inputMap.set('ArrowRight'.toLowerCase(), debugInputs.rotateRight);
  inputs.schema.inputMap.set('ArrowUp'.toLowerCase(), debugInputs.morePower);
  inputs.schema.inputMap.set('ArrowDown'.toLowerCase(), debugInputs.lessPower);

  inputs.schema.inputMap.set(GamepadButtons.Y, debugInputs.hit);
  inputs.schema.inputButtonBehaviors[debugInputs.hit] = {
    started: [
      {
        behavior: (entity: Entity) => {
          const { gameName, uuid } = getComponent(entity, GamePlayer);
          const game = getGameFromName(gameName)
          const ballEntity = game.gameObjects['GolfBall'].find((e) => getComponent(e, NetworkObject)?.ownerId === uuid)
          hitBall(ballEntity, dir.clone().multiplyScalar(arrowLength * 0.1))
        }
      }
    ]
  }

  inputs.schema.inputButtonBehaviors[debugInputs.previous] = {
    started: [
      {
        behavior: () => {
          currentTee -= 1
          if (currentTee < 0) currentTee = tees.length - 1;
          moveBall()
        }
      }
    ]
  }
  inputs.schema.inputButtonBehaviors[debugInputs.next] = {
    started: [
      {
        behavior: () => {
          currentTee += 1
          if (currentTee >= tees.length) currentTee = 0;
          moveBall()
        }
      }
    ]
  }

  inputs.schema.inputButtonBehaviors[debugInputs.rotateLeft] = {
    started: [
      {
        behavior: () => {
          dir.applyQuaternion(leftTurnQuat)
        }
      }
    ]
  }
  inputs.schema.inputButtonBehaviors[debugInputs.rotateRight] = {
    started: [
      {
        behavior: () => {
          dir.applyQuaternion(rightTurnQuat)
        }
      }
    ]
  }

  inputs.schema.inputButtonBehaviors[debugInputs.morePower] = {
    started: [
      {
        behavior: () => {
          arrowLength *= 1.2
        }
      }
    ]
  }
  inputs.schema.inputButtonBehaviors[debugInputs.lessPower] = {
    started: [
      {
        behavior: () => {
          arrowLength *= 0.8
        }
      }
    ]
  }
}