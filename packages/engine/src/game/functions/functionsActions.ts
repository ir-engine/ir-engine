import { Component } from "../../ecs/classes/Component";
import { ComponentConstructor } from '../../ecs/interfaces/ComponentInterfaces';
import { Entity } from '../../ecs/classes/Entity';
import { isClient } from '../../common/functions/isClient'
import { isServer } from '../../common/functions/isServer'
import { Network } from "../../networking/classes/Network";
import { addComponent, getComponent, getMutableComponent, hasComponent, removeComponent } from '../../ecs/functions/EntityFunctions';
import { getHisGameEntity, getHisEntity, getRole, getGame, getUuid } from './functions';
import { Game } from "../components/Game";
import { GameObject } from "../components/GameObject";
import { GamePlayer } from "../components/GamePlayer";
import { HaveBeenInteracted } from "../actions/HaveBeenInteracted";
import { GameStateActionMessage } from "../types/GameMessage";
/**
 * @author HydraFire <github.com/HydraFire>
 */
// TODO: create schema actions
const gameActionComponents = {
  'HaveBeenInteracted': HaveBeenInteracted
};

export const addActionComponent = (entity: Entity, component: ComponentConstructor<Component<any>>): void => {
  if (!hasComponent(entity, GameObject)) return; // its when game local
  const game = getComponent(entity, GameObject).game as Game
  //// Clients dont apply self actions, only in not Global mode
  if (isClient && !game.isGlobal) {
    addComponent(entity, component);
  //// Server apply actions to himself send Actions and clients apply its
  } else if (isServer && game.isGlobal) {
    addComponent(entity, component);
    sendActionComponent(entity, component);
  }
};

export const sendActionComponent = (entity: Entity, component: ComponentConstructor<Component<any>>): void => {
  const actionMessage: GameStateActionMessage = {
    game: getGame(entity).name,
    role: getRole(entity),
    component: component.name,
    uuid: getUuid(entity)
  }
  console.warn('sendActionComponent', actionMessage);
  Network.instance.worldState.gameStateActions.push(actionMessage);
};

export const applyActionComponent = (actionMessage: GameStateActionMessage): void => {
  //console.warn('applyActionComponent', actionMessage);
  const entityGame = getHisGameEntity(actionMessage.game);
  const game = getComponent(entityGame, Game);
//  console.warn(game);
  const entity = getHisEntity(game, actionMessage.role, actionMessage.uuid);
  //Component._typeId
  // Engine.componentsMap[(Component as any)._typeId]
  const component = gameActionComponents[actionMessage.component]
  addComponent( entity, component);
};
