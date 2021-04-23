import { Entity } from '../../ecs/classes/Entity';
import { Component } from "../../ecs/classes/Component";
import { ComponentConstructor } from '../../ecs/interfaces/ComponentInterfaces';

import { Network } from "../../networking/classes/Network";
import { Game } from "../components/Game";
import { GameMode } from "../types/GameMode";

import { addComponent, getComponent, getMutableComponent, hasComponent, removeComponent } from '../../ecs/functions/EntityFunctions';
import { getHisGameEntity, getHisEntity, getRole, getGame, getUuid } from './functions';

import { GameStateUpdateMessage } from "../types/GameMessage";

export const initState = (game: Game, gameSchema: GameMode): void => {
  Object.keys(gameSchema.gameObjectRoles).forEach(role => game.gameObjects[role] = []);
  Object.keys(gameSchema.gamePlayerRoles).forEach(role => game.gamePlayers[role] = []);
};

export const saveInitStateCopy = (): void => {
  //TODO:
};
export const reInitState = (): void => {
  //TODO:
};
export const sendState = (game: Game): void => {
  Network.instance.worldState.gameState.push({ game: game.name, state: game.state });
};

export const applyStateToClient = (stateMessage: GameStateUpdateMessage): void => {
  const entity = getHisGameEntity(stateMessage.game);
  getMutableComponent(entity, Game).state = stateMessage.state;
  console.warn('applyStateToClient', applyStateToClient);
};

export const correctState = (): void => {
  //TODO:
};

export const addStateComponent = (entity: Entity, component: ComponentConstructor<Component<any>>): void => {

  const uuid = getUuid(entity);
  const role = getRole(entity);
  const game = getGame(entity);

  addComponent(entity, component);

  const objectState = game.state.find(v => v.uuid === uuid) ?? { uuid: uuid, role: role, components: [], storage: [] };
  const index = objectState.components.findIndex(name => name === component.name);
  if (index === -1) {
    objectState.components.push(component.name);
    game.state.push(objectState);
  } else {
    console.warn('we have this gameState already, why?', component.name);
  }
  console.log(game.state);
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
  console.warn(game.state);
};
