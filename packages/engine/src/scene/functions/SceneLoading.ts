import { LOADER_STATUS } from "../../assets/constants/LoaderConstants";
import { isClient } from "../../common/functions/isClient";
import { isServer } from "../../common/functions/isServer";
import { Engine } from '../../ecs/classes/Engine';
import { EngineEvents } from '../../ecs/classes/EngineEvents';
import { Entity } from "../../ecs/classes/Entity";
import { addComponent, createEntity } from '../../ecs/functions/EntityFunctions';
import { SceneTagComponent } from '../components/Object3DTagComponents';
import { SceneObjectLoadingSchema } from '../constants/SceneObjectLoadingSchema';
import { SceneData } from "../interfaces/SceneData";
import { SceneDataComponent } from "../interfaces/SceneDataComponent";

export function loadScene(scene: SceneData): void {
  const loadPromises = [];
  let loaded = 0;

  if (isClient) {
    console.warn(scene);
    console.warn(Engine.scene);
  }

  Object.keys(scene.entities).forEach(key => {
    const sceneEntity = scene.entities[key];
    const entity = createEntity();
    addComponent(entity, SceneTagComponent);
    sceneEntity.components.forEach(component => {
      if (['game-object', 'gltf-model', 'mesh-collider', 'vehicle-saved-in-scene'].includes(component.name)) {
        component.data.sceneEntityId = sceneEntity.entityId;
      }

      if (isClient && component.name === 'gltf-model' && !component.data.dontParseModel) {
        loadPromises.push(new Promise<void>((resolve) => {
          EngineEvents.instance.addEventListener(EngineEvents.EVENTS.ASSET_LOADER, (e) => {
            if (e.data.entityId === entity.id && e.data.status !== LOADER_STATUS.LOADING) {
              loaded++;
              resolve();
              EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.ENTITY_LOADED, left: (loadPromises.length - loaded) });
            }
          });
        }));
      }
      loadComponent(entity, component);
    });
  });

  Promise.all(loadPromises).then(() => {
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.SCENE_LOADED });
    Engine.sceneLoaded = true;
  });
}

export function loadComponent(entity: Entity, component: SceneDataComponent): void {
  const name = component.name.replace(/-\d+/, "").replace(" ", "")
  // Override for loading mesh colliders

  if (SceneObjectLoadingSchema[name] === undefined)
    return console.warn("Couldn't load ", name);

  const componentSchema = SceneObjectLoadingSchema[name];
  // console.log(entity, component, componentSchema)
  // for each component in component name, call behavior
  componentSchema.behaviors?.forEach(b => {
    // its allow to work colliders without download glb
    // For each value, from component.data
    const values = {};
    b.values?.forEach(val => {
      // dont load glb model if dont need to parse colliders
      if (isServer && component.name === 'gltf-model' && component.data.dontParseModel) {
        console.log('Stop download glb if dontParseModel');
        return;
      }

      // Does it have a from and to field? Let's map to that
      if (val['from'] !== undefined) {
        values[val['to']] = component.data[val['from']];
      }
      else {
        values[val] = component.data[val];
      }
    });

    // run behavior after load model
  //  if ((b as any).onLoaded) values['onLoaded'] = (b as any).onLoaded;

    // Invoke behavior with args and spread args
    b.behavior(entity, { ...b.args, objArgs: { ...b.args?.objArgs, ...values } });
  });

  // for each component in component name, add component
  componentSchema.components?.forEach(c => {
    // For each value, from component.data, add to args object
    const values = c.values ? c.values.map(val => component.data[val]) : {};
    // Add component with args
    addComponent(entity, c.type, values);
  });
}
