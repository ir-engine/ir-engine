import { Component } from "../../ecs/classes/Component";
import { Entity } from '../../ecs/classes/Entity';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { ComponentConstructor } from '../../ecs/interfaces/ComponentInterfaces';
import { InitStorageInterface } from '../types/GameMode';
import { getGame, getRole, getUuid } from './functions';

/**
 * @author HydraFire <github.com/HydraFire>
 */

const customConverter = (str: string) => str.split(';').reduce((acc, v) => Object.assign(acc, { [v.split('=')[0]] : Object.assign({}, ...(v.split('=')[1] ? v.split('=')[1].split(',').map(value => (isNaN(parseFloat(value.split('_')[1])) ? {} : { [value.split('_')[0]]: parseFloat(value.split('_')[1]) })) : [{}]) ) }), {});


const customArchives = (variable: string, objData) => variable+'='+Object.keys(objData).map(v => [v,objData[v]].join('_')).join(',')+ ';';


export const initStorage = (entity: Entity, initSchemaStorege: InitStorageInterface[]): void => {
  const role = getRole(entity);
  const uuid = getUuid(entity);
  const game = getGame(entity);
  const objectState = game.state.find(v => v.uuid === uuid)
  if (objectState != undefined) {
    objectState.storage = initSchemaStorege.map(v => {
      const temp = getComponent(entity, v.component);
      const readyValues = v.variables.reduce((acc, variable) => acc + customArchives(variable, temp[variable]), '');
      // Object.assign(acc, { [variable]: customArchives(variable, temp[variable]) }),'')
      return { component: v.component.name, variables: readyValues};
    })
  } else {
    console.warn('uuid DONT EXIST IN STATE');
  }
};



export const getStorage = (entity: Entity, component: any): any => {
  const role = getRole(entity);
  const uuid = getUuid(entity);
  const game = getGame(entity);
  const objectState = game.state.find(v => v.uuid === uuid);
  return customConverter(objectState.storage.find(v => v.component === component.name).variables);//JSON.parse();
};



export const setStorage = (entity: Entity, component: any, data: any): void => {
  const role = getRole(entity);
  const uuid = getUuid(entity);
  const game = getGame(entity);

  const objectState = game.state.find(v => v.uuid === uuid);
  const storageComponent = objectState.storage.find(v => v.component === component.name);

  if (storageComponent === undefined) {
    objectState.storage.push({ component: component.name, variables: Object.keys(data).reduce((acc, variable) => acc + customArchives(variable, data[variable]), '') });
  } else {
    const oldVariables = customConverter(storageComponent.variables);
    Object.keys(data).forEach(prop => { oldVariables[prop] = data[prop] });
    storageComponent.variables = Object.keys(oldVariables).reduce((acc, variable) => acc + customArchives(variable, oldVariables[variable]), '');
  }
};
/*
export const cleanStorage = (entity: Entity, component: Component): void => {
  const role = getRole(entity);
  const uuid = getUuid(entity);
  const game = getComponent( getGameEntityFromName( getUuid(entity)), Game);
  const finded = game.State[role].find(schema => schema.uuid === uuid);
  finded.storage = [];
};
*/
