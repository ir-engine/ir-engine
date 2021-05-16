import { isClient } from '../../common/functions/isClient';
import { isServer } from '../../common/functions/isServer';
import { Component } from "../../ecs/classes/Component";
import { Entity } from '../../ecs/classes/Entity';
import { addComponent, getMutableComponent, hasComponent, removeComponent } from '../../ecs/functions/EntityFunctions';
import { ComponentConstructor } from '../../ecs/interfaces/ComponentInterfaces';
import { Network } from "../../networking/classes/Network";

import { Game } from "../components/Game";
import { GamePlayer } from "../components/GamePlayer";

import { ButtonDown } from '../templates/gameDefault/components/ButtonDownTagComponent';
import { ButtonUp } from '../templates/gameDefault/components/ButtonUpTagComponent';
import { Closed } from '../templates/gameDefault/components/ClosedTagComponent';
import { Open } from '../templates/gameDefault/components/OpenTagComponent';
import { PanelDown } from '../templates/gameDefault/components/PanelDownTagComponent';
import { PanelUp } from '../templates/gameDefault/components/PanelUpTagComponent';
import { YourTurn } from '../templates/Golf/components/YourTurnTagComponent';
import { Active } from "../templates/gameDefault/components/ActiveTagComponent";
import { Deactive } from "../templates/gameDefault/components/DeactiveTagComponent";
import { FromPlayer1, FromPlayer2, FromPlayer3 } from "../templates/Golf/components/FromPlayer1TagComponent";

import { GamesSchema } from '../templates/GamesSchema';
import { ClientGameActionMessage, GameStateUpdateMessage } from "../types/GameMessage";
import { GameMode, StateObject } from "../types/GameMode";
import { getGame, getGameEntityFromName, getRole, setRole, getUuid } from './functions';
/**
 * @author HydraFire <github.com/HydraFire>
 */

// TODO: create schema states
const gameStateComponents = {
  'Open': Open,
  'Closed': Closed,
  'ButtonUp': ButtonUp,
  'ButtonDown': ButtonDown,
  'PanelDown': PanelDown,
  'PanelUp': PanelUp,
  'YourTurn': YourTurn,
  'Active': Active,
  'Deactive': Deactive,
  'FromPlayer1': FromPlayer1,
  'FromPlayer2': FromPlayer2,
  'FromPlayer3': FromPlayer3
};

export const initState = (game: Game, gameSchema: GameMode): void => {
  Object.keys(gameSchema.gameObjectRoles).forEach(role => game.gameObjects[role] = []);
  Object.keys(gameSchema.gamePlayerRoles).forEach(role => game.gamePlayers[role] = []);
};

export const saveInitStateCopy = (entity: Entity): void => {
  const game = getMutableComponent(entity, Game);
  game.initState = JSON.stringify(game.state);
};

export const reInitState = (game: Game): void => {
  game.state = JSON.parse(game.initState);
  applyState(game);
  //console.warn('reInitState', applyStateToClient);
};

export const sendState = (game: Game, playerComp: GamePlayer): void => {
  if (isServer && game.isGlobal) {
    const message: GameStateUpdateMessage = { game: game.name, ownerId: playerComp.uuid, state: game.state };
  //  console.warn('sendState', message);
    Network.instance.worldState.gameState.push(message);
  }
};

export const requireState = (game: Game, playerComp: GamePlayer): void => {
  if (isClient && game.isGlobal && playerComp.uuid === Network.instance.userId) {
    const message: ClientGameActionMessage = { type: 'require', game: game.name, ownerId: playerComp.uuid };
    Network.instance.clientGameAction.push(message);
  }
};

export const applyStateToClient = (stateMessage: GameStateUpdateMessage): void => {
  const entity = getGameEntityFromName(stateMessage.game);
  const game = getMutableComponent(entity, Game)
  game.state = stateMessage.state;
  console.warn('applyStateToClient', game.state);
  applyState(game);
};

export const applyState = (game: Game): void => {
  const gameSchema = GamesSchema[game.gameMode]

  // clean all states
  Object.keys(game.gamePlayers).concat(Object.keys(game.gameObjects)).forEach((role: string) => {
    (game.gameObjects[role] || game.gamePlayers[role]).forEach((entity: Entity) => {
      const uuid = getUuid(entity);
/*
      gameSchema.registerActionTagComponents.forEach(component => {
        hasComponent(entity, component ) ? removeComponent(entity, component):'';
      });
*/
      gameSchema.registerStateTagComponents.forEach(component => {
        hasComponent(entity, component ) ? removeComponent(entity, component):'';
      });
      // add all states
    //  console.warn('// add all states');
    //  console.warn(uuid);

    })
  })
  Object.keys(game.gamePlayers).concat(Object.keys(game.gameObjects)).forEach((role: string) => {
    (game.gameObjects[role] || game.gamePlayers[role]).forEach((entity: Entity) => {
      const uuid = getUuid(entity);

      const stateObject = game.state.find((v: StateObject) => v.uuid === uuid);
      //  console.warn(stateObject);
      if (stateObject != undefined) {
        stateObject.components.forEach((componentName: string) => {
          if(gameStateComponents[componentName])
            addComponent(entity, gameStateComponents[componentName] );
          else
            console.warn("Couldn't find component", componentName);
        });
      } else {
        console.warn('game.state dont have this object but server have, v.uuid != uuid');
      }
    })
  });
  //console.warn('applyState', game.state);
};

export const correctState = (): void => {
  //TODO:
};

export const addStateComponent = (entity: Entity, component: ComponentConstructor<Component<any>>): void => {

  const uuid = getUuid(entity);
  const role = getRole(entity);
  const game = getGame(entity);

  addComponent(entity, component);

  let objectState = game.state.find(v => v.uuid === uuid);

  if (objectState === undefined) {
    objectState = { uuid: uuid, role: role, components: [], storage: [] };
    game.state.push(objectState);
  }

  const index = objectState.components.findIndex(name => name === component.name);
  if (index === -1) {
    objectState.components.push(component.name);
  } else {
    console.warn('we have this gameState already, why?', component.name);
  }
  //console.log(game.state);
};


export const removeStateComponent = (entity: Entity, component: ComponentConstructor<Component<any>>): void => {

  const uuid = getUuid(entity);
  const game = getGame(entity);

  removeComponent(entity, component);

  const objectState = game.state.find(v => v.uuid === uuid);
  const index = objectState.components.findIndex(name => name === component.name);
  if (index === -1) {
    console.warn('dont exist in gameState already, why?', component.name);
  } else {
    objectState.components.splice(index, 1);
  }
  //console.warn(game.state);
};

export const changeRole = (entity: Entity, newGameRole: string): void => {

  const uuid = getUuid(entity);
  const game = getGame(entity);

  let objectState = game.state.find(v => v.uuid === uuid);

  if (objectState === undefined) {
    objectState = { uuid: uuid, role: '', components: [], storage: [] };
    game.state.push(objectState);
    console.log('dont have this entity in State');
  }

  objectState.role = newGameRole;
  objectState.components = [];
  objectState.storage = [];

  setRole(entity, newGameRole);

  Object.keys(game.gamePlayers).forEach(role => {
    const index = game.gamePlayers[role].findIndex(entityF => uuid === getUuid(entityF));
    if (index != -1) {
      game.gamePlayers[role].splice(index, 1);
    }
  })

  game.gamePlayers[newGameRole].push(entity);

  const gameSchema = GamesSchema[game.gameMode];
  const schema = gameSchema.initGameState[newGameRole];
  if (schema != undefined) {
    schema.components?.forEach(component => addStateComponent(entity, component));
    //initStorage(entity, schema.storage);
    schema.behaviors?.forEach(behavior => behavior(entity));
  }
};
