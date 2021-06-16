import { Component } from "../../ecs/classes/Component";
import { Entity } from '../../ecs/classes/Entity';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { ComponentConstructor } from '../../ecs/interfaces/ComponentInterfaces';
import { InitStorageInterface } from '../types/GameMode';
import { getGame, getRole, getUuid } from './functions';

/**
 * @author HydraFire <github.com/HydraFire>
 */
/*
const customConverter = (str: string) => str.split(';').reduce((acc, v) => Object.assign(acc, { [v.split('=')[0]] : Object.assign({}, ...(v.split('=')[1] ? v.split('=')[1].split(',').map(value => (isNaN(parseFloat(value.split('_')[1])) ? {} : { [value.split('_')[0]]: parseFloat(value.split('_')[1]) })) : [{}]) ) }), {});


const customArchives = (variable: string, objData) => variable+'='+Object.keys(objData).map(v => [v,objData[v]].join('_')).join(',')+ ';';
*/

export const initStorage = (entity: Entity, initSchemaStorege: InitStorageInterface[]): void => {
  if (initSchemaStorege === undefined) return;
  const role = getRole(entity);
  const uuid = getUuid(entity);
  const game = getGame(entity);
  const objectState = game.state.find(v => v.uuid === uuid)
  // console.log('initStorage 1', objectState, initSchemaStorege)
  if (objectState != undefined) {
    objectState.storage = initSchemaStorege.map(v => {
      const data = getComponent(entity, v.component);
      const readyValues = v.variables.reduce((acc, variable) => Object.assign(acc, { [variable]: data[variable] }), {});
      // console.log('initStorage 2', data, readyValues)
      return { component: v.component.name, variables: JSON.stringify(readyValues).replace(/"/g, '\'')};
    })
  } else {
    console.warn('initStorage: uuid DONT EXIST IN STATE, role:'+ role);
  }
};



export const getStorage = (entity: Entity, component: any): any => {
  const role = getRole(entity);
  const uuid = getUuid(entity);
  const game = getGame(entity);
  const objectState = game.state.find(v => v.uuid === uuid);
  const storageComponent = objectState.storage.find(v => v.component === component.name);
  if(!storageComponent) return {}; // empty just in case
  return JSON.parse(storageComponent.variables.replace(/'/g, '"'))//customConverter(objectState.storage.find(v => v.component === component.name).variables);//JSON.parse();
};



export const setStorage = (entity: Entity, component: any, data: any): void => {
  const role = getRole(entity);
  const uuid = getUuid(entity);
  const game = getGame(entity);

  const objectState = game.state.find(v => v.uuid === uuid);
  const storageComponent = objectState.storage.find(v => v.component === component.name);

  if (storageComponent === undefined) {
    objectState.storage.push({ component: component.name, variables: JSON.stringify(data).replace(/"/g, '\'') });
  } else {
    const oldVariables = JSON.parse(storageComponent.variables.replace(/'/g, '"'));
    Object.keys(data).forEach(prop => { oldVariables[prop] = data[prop] });
    storageComponent.variables = JSON.stringify(oldVariables).replace(/"/g, '\''); //Object.keys(oldVariables).reduce((acc, variable) => Object.assign(acc, { [variable]: customArchives(variable, temp[variable]) }),'');
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
