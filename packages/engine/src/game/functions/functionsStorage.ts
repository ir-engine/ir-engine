import { Component } from "../../ecs/classes/Component";
import { ComponentConstructor } from '../../ecs/interfaces/ComponentInterfaces';
import { Entity } from '../../ecs/classes/Entity';
import { addComponent, getComponent, getMutableComponent, hasComponent, removeComponent } from '../../ecs/functions/EntityFunctions';
import { getHisGameEntity, getHisEntity, getRole, getGame, getUuid } from './functions';
import { InitStorageInterface } from '../types/GameMode';

function customConverter(str) {
  const arr = str.split(',');
  const variable = arr[0];
  const data = {
    x: parseFloat(arr[1]),
    y: parseFloat(arr[2]),
    z: parseFloat(arr[3])
  };
  return {
    [variable]: data
  }
}

function customArhives(variable: string, objData) {
  const data = objData.x+', '+objData.y+', '+objData.z;
  return variable+', '+data;
}

export const initStorage = (entity: Entity, initSchemaStorege: InitStorageInterface[]): void => {
  const role = getRole(entity);
  const uuid = getUuid(entity);
  const game = getGame(entity);
  const objectState = game.state.find(v => v.uuid === uuid)
  if (objectState != undefined) {
    objectState.storage = initSchemaStorege.map(v => {
      const temp = getComponent(entity, v.component);
      const readyValues = v.variables.reduce((acc, variable) => acc + customArhives(variable, temp[variable]), '');
      // Object.assign(acc, { [variable]: customArhives(variable, temp[variable]) }),'')
      return { component: v.component.name, variables: readyValues};
    })
  } else {
    console.warn('uuid DONT EXIST IN STATE');
  }
};

export const getStorage = (entity: Entity, component: ComponentConstructor<Component<any>>): any => {
  const role = getRole(entity);
  const uuid = getUuid(entity);
  const game = getGame(entity);
  const objectState = game.state.find(v => v.uuid === uuid);
  return customConverter(objectState.storage.find(v => v.component === component.name).variables);//JSON.parse();
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
