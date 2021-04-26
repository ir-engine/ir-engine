import { Component } from "../../ecs/classes/Component";
import { ComponentConstructor } from '../../ecs/interfaces/ComponentInterfaces';
import { Entity } from '../../ecs/classes/Entity';
import { addComponent, getComponent, getMutableComponent, hasComponent, removeComponent } from '../../ecs/functions/EntityFunctions';
import { getHisGameEntity, getHisEntity, getRole, getGame, getUuid } from './functions';
import { InitStorageInterface } from '../types/GameMode';

export const initStorage = (entity: Entity, initSchemaStorege: InitStorageInterface[]): void => {
  const role = getRole(entity);
  const uuid = getUuid(entity);
  const game = getGame(entity);
  const objectState = game.state.find(v => v.uuid === uuid)
  if (objectState != undefined) {
    objectState.storage = initSchemaStorege.map(v => {
      const temp = getComponent(entity, v.component);
      const readyValues = v.variables.reduce((acc, variable) => Object.assign(acc, { [variable]: temp[variable] }),{})
      return { component: v.component.name, variables: 'position, x:1, y: 0, z: 5'/*JSON.stringify(readyValues)*/};
    })
    console.warn('initStorage');
  } else {
    console.warn('uuid DONT EXIST IN STATE');
  }
};

export const getStorage = (entity: Entity, component: ComponentConstructor<Component<any>>): void => {
  const role = getRole(entity);
  const uuid = getUuid(entity);
  const game = getGame(entity);
  const objectState = game.state.find(v => v.uuid === uuid);
  return JSON.parse(objectState.storage.find(v => v.component === component.name).variables);
};

export const setStorage = (entity: Entity, component: ComponentConstructor<Component<any>>, data: any): void => {
  const role = getRole(entity);
  const uuid = getUuid(entity);
  const game = getGame(entity);

  const objectState = game.state.find(v => v.uuid === uuid);
  const storageComponent = objectState.storage.find(v => v.component === component.name);

  if (storageComponent === undefined) {
    objectState.storage.push({ component: component.name, variables: JSON.stringify(data)});
  } else {
    const oldVariables = JSON.parse(storageComponent.variables);
    Object.keys(data).forEach(prop => { oldVariables[prop] = data[prop] });
    storageComponent.variables = JSON.stringify(oldVariables);
  }
};
/*
export const cleanStorage = (entity: Entity, component: Component): void => {
  const role = getRole(entity);
  const uuid = getUuid(entity);
  const game = getComponent( getHisGameEntity( getUuid(entity)), Game);
  const finded = game.State[role].find(schema => schema.uuid === uuid);
  finded.storage = [];
};
*/
