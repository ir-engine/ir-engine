import { hasWindow } from "../../common/functions/hasWindow";
import { System } from '../classes/System';
import { executeSystem } from './SystemFunctions';
import { Engine } from '../classes/Engine';
import { EngineOptions } from '../interfaces/EngineOptions';
import { Timer } from "../../common/functions/Timer";
import { now } from "../../common/functions/now";
import { removeAllComponents, removeAllEntities } from "./EntityFunctions";

/**
 * Initialize options on the engine object and fire a command for devtools
 * WARNING: This is called by initializeEngine() in {@link @xr3ngine/engine/initialize#initializeEngine}
 * (You probably don't want to use this) 
 */
export function initialize (options?: EngineOptions) {
  Engine.options = { ...Engine.options, ...options };
  if (hasWindow && typeof CustomEvent !== 'undefined') {
    const event = new CustomEvent('world-created');
    window.dispatchEvent(event);
  }

  Engine.lastTime = now() / 1000;
}

export function reset(): void {
  console.log('reset start');

  // clear all entities components
  Engine.entities.forEach(entity => {
    removeAllComponents(entity, false);
  });
  execute(0.001); // for systems to handle components deletion

  // delete all entities
  removeAllEntities();

  // for systems to handle components deletion
  execute(0.001);

  if (Engine.entities.length) {
    console.log('Engine.entities.length', Engine.entities.length);
    throw new Error('Engine.entities cleanup not complete');
  }

  Engine.tick = 0;

  Engine.entities.length = 0;
  Engine.entitiesToRemove.length = 0;
  Engine.entitiesWithComponentsToRemove.length = 0;
  Engine.nextEntityId = 0;

  // cleanup/unregister components
  Engine.components.length = 0;
  // Engine.componentsMap = {}
  // Engine.numComponents = {}
  // Engine.componentPool = {}
  Engine.nextComponentId = 0;

  // cleanup systems
  Engine.systems.forEach(system => {
    system.dispose();
  });
  Engine.systems.length = 0;
  Engine.systemsToExecute.length = 0;

  // cleanup queries
  Engine.queries.length = 0;

  // cleanup events
  Engine.eventDispatcher.reset();

  // delete all what is left on scene
  if (Engine.scene) {
    // TODO: check if we need to add materials, textures, geometries detections and dispose() call?
    Engine.scene = null;
  }

  Engine.camera = null;

  if (Engine.renderer) {
    Engine.renderer.dispose();
    Engine.renderer = null;
  }

  console.log('reset finished');
}

/**
 * Execute all systems (a "frame")
 * This is typically called on a loop
 * WARNING: This is called by initializeEngine() in {@link @xr3ngine/engine/initialize#initializeEngine}
 * (You probably don't want to use this) 
 */
export function execute (delta?: number, time?: number): void {
  Engine.tick++;
  if (!delta) {
    time = now() / 1000;
    delta = time - Engine.lastTime;
    Engine.lastTime = time;
  }

  if (Engine.enabled) {
    Engine.systemsToExecute.forEach(system => system.enabled && executeSystem(system, delta, time));
    processDeferredEntityRemoval();
  }
}

/**
 * Remove entities at the end of a simulation frame
 * NOTE: By default, the engine is set to process deferred removal, so this will be called
 */
function processDeferredEntityRemoval () {
  if (!Engine.deferredRemovalEnabled) {
    return;
  }
  const entitiesToRemove = Engine.entitiesToRemove;
  const entitiesWithComponentsToRemove = Engine.entitiesWithComponentsToRemove;
  for (let i = 0; i < entitiesToRemove.length; i++) {
    const entity = entitiesToRemove[i];
    const index = Engine.entities.indexOf(entity);
    Engine.entities.splice(index, 1);
    entity._pool.release(entity);
  }
  entitiesToRemove.length = 0;

  for (let i = 0; i < entitiesWithComponentsToRemove.length; i++) {
    const entity = entitiesWithComponentsToRemove[i];
    while (entity.componentTypesToRemove.length > 0) {
      const Component = entity.componentTypesToRemove.pop();

      const component = entity.componentsToRemove[Component._typeId];
      delete entity.componentsToRemove[Component._typeId];
      component.dispose();
      Engine.numComponents[component._typeId]--;
    }
  }

  Engine.entitiesWithComponentsToRemove.length = 0;
}

/**
 * Disable execution of systems without stopping timer
 */
export function pause (): void {
  Engine.enabled = false;
  Engine.systemsToExecute.forEach(system => system.stop());
}

/**
 * Get stats for all entities, components and systems in the simulation
 */
export function stats (): { entities: any, system: any } {
  const queryStats = {};
  for (const queryName in Engine.queries) {
    queryStats[queryName] = Engine.queries[queryName].stats();
  }

  const entityStatus = {
    numEntities: Engine.entities.length,
    numQueries: Object.keys(System.queries).length,
    queries: queryStats,
    numComponentPool: Object.keys(Engine.componentPool).length,
    componentPool: {},
    eventDispatcher: (Engine.eventDispatcher as any).stats
  };

  for (const componentId in Engine.componentPool) {
    const pool = Engine.componentPool[componentId];
    entityStatus.componentPool[pool.type.name] = {
      used: pool.poolSize - pool.freeList.length,
      size: pool.count
    };
  }

  const systemStatus = {
    numSystems: Engine.systems.length,
    systems: {}
  };

  for (let i = 0; i < Engine.systems.length; i++) {
    const system = Engine.systems[i];
    const systemStats = (systemStatus.systems[system.name] = {
      queries: {},
      executeTime: system.executeTime
    });
    for (const name in system.ctx) {
      systemStats.queries[name] = system.ctx[name].stats();
    }
  }

  return {
    entities: entityStatus,
    system: systemStatus
  };
}

export function resetEngine() {
  if (Engine.engineTimerTimeout) {
    clearTimeout(Engine.engineTimerTimeout);
  }
  Engine.engineTimer?.stop();

  reset();
}

export function startTimer () {
  setTimeout(() => {
    Engine.engineTimer = Timer({
      update: (delta, elapsedTime) => execute(delta, elapsedTime)
    }).start();
  }, 1);
}