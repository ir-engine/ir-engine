import { isClient } from '../../common/functions/isClient';
import { isServer } from '../../common/functions/isServer';
import { Component } from "../../ecs/classes/Component";
import { Entity } from '../../ecs/classes/Entity';
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/EntityFunctions';
import { ComponentConstructor } from '../../ecs/interfaces/ComponentInterfaces';
import { Network } from "../../networking/classes/Network";
import { HaveBeenInteracted } from "../actions/HaveBeenInteracted";
import { HasHadCollision } from "../actions/HasHadCollision";
import { Game } from "../components/Game";
import { GameObject } from "../components/GameObject";
import { GamePlayer } from "../components/GamePlayer";
import { GameStateActionMessage } from "../types/GameMessage";
import { getEntityFromRoleUuid, getGame, getGameEntityFromName, getRole, getUuid } from './functions';
/**
 * @author HydraFire <github.com/HydraFire>
 */
// TODO: create enum actions
const gameActionComponents = {
  'HaveBeenInteracted': HaveBeenInteracted,
  'HasHadCollision': HasHadCollision
};

export const addActionComponent = (entity: Entity, component: ComponentConstructor<Component<any>>, componentArgs: any = { }): void => {
  if (!(hasComponent(entity, GameObject) || hasComponent(entity, GamePlayer))) return;
  const game = getGame(entity);
  //// Clients dont apply self actions, only in not Global mode
  if (isClient && !game.isGlobal) {
    addComponent(entity, component, componentArgs);
  //// Server apply actions to himself send Actions and clients apply its
  } else if (isServer && game.isGlobal) {
    addComponent(entity, component, componentArgs);
    sendActionComponent(entity, component, componentArgs);
  }
};

export const sendActionComponent = (entity: Entity, component: ComponentConstructor<Component<any>>, componentArgs: any = { }): void => {
  const actionMessage: GameStateActionMessage = {
    game: getGame(entity).name,
    role: getRole(entity),
    component: component.name,
    uuid: getUuid(entity),
    componentArgs: JSON.stringify(componentArgs).replace(/"/g, '\'') // replace double quotes with single quotes so it is read properly in buffer
  }
  // console.log('sendActionComponent', actionMessage);
  Network.instance.worldState.gameStateActions.push(actionMessage);
};

export const applyActionComponent = (actionMessage: GameStateActionMessage): void => {
  // console.warn('applyActionComponent', actionMessage);
  const entityGame = getGameEntityFromName(actionMessage.game);
  if(!entityGame) return;
  const game = getComponent(entityGame, Game);
//  console.warn(game);
  const entity = getEntityFromRoleUuid(game, actionMessage.role, actionMessage.uuid);
  if(!entity) return;
  //Component._typeId
  // Engine.componentsMap[(Component as any)._typeId]
  const component = gameActionComponents[actionMessage.component]
  let componentArgs = {};
  try {
    componentArgs = JSON.parse(actionMessage.componentArgs.replace(/'/g, '"')); // replace single quotes with double quotes
  } catch (e) {}
  addComponent( entity, component, componentArgs);
};
