import { hasWindow } from "../../common/functions/hasWindow";
import { System } from '../classes/System';
import { executeSystem } from './SystemFunctions';
import { Engine } from '../classes/Engine';
import { EngineOptions } from '../interfaces/EngineOptions';
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
  console.log('reset start')
  // console.log('stats', stats())
  console.log('Engine.componentPool', Engine.componentPool)

  // clear all entities components
  Engine.entities.forEach(entity => {
    console.log('delete all components from entity', entity)
    console.log('components count0', entity.componentTypes.length)
    removeAllComponents(entity, false)
    console.log('components count1', entity.componentTypes.length)
  })
  // debugger
  execute(0.001) // for systems to handle components deletion
  // debugger

  // delete all entities
  removeAllEntities()
  console.log('Engine.entitiesToRemove', Engine.entitiesToRemove)
  console.log('Engine.entitiesWithComponentsToRemove', Engine.entitiesWithComponentsToRemove)
  // debugger
  // console.log('reset entities deleted', stats())
  execute(0.001) // for systems to handle components deletion
  console.log('Engine.entitiesToRemove', Engine.entitiesToRemove)
  console.log('Engine.entitiesWithComponentsToRemove', Engine.entitiesWithComponentsToRemove)
  // debugger
// console.log('reset execute 1', stats())
  execute(0.001) // for systems to handle components deletion
// console.log('reset execute 2', stats())

  Engine.entities.length = 0
  Engine.nextEntityId = 0

// cleanup/unregister components
// TODO: cleanup

//   console.log('Engine.components', Engine.components.length, [...Engine.components])
//   console.log('Engine.componentPool', Engine.componentPool)
//   console.log('Engine.numComponents', Engine.numComponents)
//   Object.values(Engine.componentPool).forEach((pool: { freeList: [], poolSize: number, type: any }) => {
//     console.log('disposing pool', pool)
//     pool.freeList.forEach(c => {
//       console.log('--- c', c)
//     })
//     // component.dispose()
//     //Engine.componentPool[component]
//   })
  Engine.components.length = 0
// Engine.componentsMap = {}
// Engine.numComponents = {}
// Engine.componentPool = {}
  Engine.nextComponentId = 0

// cleanup systems
  Engine.systems.forEach(system => {
    system.dispose()
  })
  Engine.systems.length = 0
  Engine.systemsToExecute.length = 0

// cleanup queries
// TODO: cleanup
  Engine.queries.length = 0

// cleanup events
  Engine.eventDispatcher.reset()

// TODO: delete all what is left from scene
  Engine.scene.dispose()
  Engine.scene.traverse((child: any) => {
    if (typeof child.dispose === 'function') {
      console.log('child dispose')
      child.dispose()
      child.remove()
    }
  })
  Engine.scene = null

  Engine.camera = null

  Engine.renderer.dispose()
  Engine.renderer = null

  console.log('reset finished')
// console.log('stats', stats())
// console.log('Engine', this)
}

/**
 * Execute all systems (a "frame")
 * This is typically called on a loop
 * WARNING: This is called by initializeEngine() in {@link @xr3ngine/engine/initialize#initializeEngine}
 * (You probably don't want to use this) 
 */
export function execute (delta?: number, time?: number): void {
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
