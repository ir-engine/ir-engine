import { Entity } from "../../../../ecs/classes/Entity";
import { Network } from "../../../../networking/classes/Network"
import { ClientNetworkStateSystem } from "../../../../networking/systems/ClientNetworkStateSystem"
import { getGame } from "../../../functions/functions";
import { GolfPrefabTypes } from "../GolfGameConstants"


export const setupOfflineDebug = (entity: Entity) => {
  
  const game = getGame(entity);

  // Assign club to player
  const clubCreateObjectProps = {
    networkId: 2,
    ownerId: Network.instance.userId,
    uniqueId: 'D8D07D28-D2B3-4995-89AA-9DD868CCDF79',
    prefabType: GolfPrefabTypes.Club,
    parameters: {
      gameName: game.name,
      role: 'GolfClub',
      uuid: 'D8D07D28-D2B3-4995-89AA-9DD868CCDF79',
      ownerNetworkId: 1
    }
  }

  // Spawn the player's golf club
  ClientNetworkStateSystem.instance.receivedServerWorldState.push({
    clientsConnected: [],
    clientsDisconnected: [],
    createObjects: [clubCreateObjectProps],
    editObjects: [],
    destroyObjects: [],
    gameState: [],
    gameStateActions: [],
  })

  /**
   * @todo: add offline testing inputs, do all logic for switching between holes here
   * - X and Y on oculus controller which go to next or previous hole
   * - have to add 
   **/
}