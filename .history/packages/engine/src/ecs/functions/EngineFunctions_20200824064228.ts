import { hasWindow } from "../../common/functions/hasWindow";
import { System } from '../classes/System';
import { executeSystem } from './SystemFunctions';
import { Engine } from '../classes/Engine';
import { EngineOptions } from '../interfaces/EngineOptions';
import { now } from "../../common/functions/now";
import { CameraOperator } from "../../actor/classes/core/CameraOperator";
import { SAPBroadphase, World } from "cannon-es";
import { default as CSM } from 'three-csm';

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

// TODO: Move to rendering
  let splitsCallback = (amount, near, far) =>
  {
    return [
      Math.pow(1 / 3, 3),
      Math.pow(1 / 3, 2),
      Math.pow(1 / 3, 1),
      Math.pow(1 / 3, 0)
    ];
  };

  Engine.csm = new CSM({
    fov: 80,
    far: 300,
    lightIntensity: 2.5,
    cascades: 4,
    shadowMapSize: 2048,
    camera: Engine.camera,
    parent: Engine.scene,
    mode: 'custom',
    customSplitsCallback: splitsCallback
  });



    Engine.renderDelta = 0;
    Engine.logicDelta = 0;
    Engine.sinceLastFrame = 0;
    Engine.justExecuted = false;

    Engine.stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( Engine.stats.dom );

    // TODO: Clean up and move to right spots
    // Variables
		let params = {
			FPS_Limit: 60,
			Time_Scale: 1,
			Draw_Physics: false,
			RayCast_Debug: false,
			Phi: 60,
			Theta: 225,
    };
    
    Engine.params = params;
    Engine.clock.start()

    Engine.cameraOperator = new CameraOperator(Engine.camera, Engine.params.Mouse_Sensitivity);

}

/**
 * Execute all systems (a "frame")
 * This is typically called on a loop
 * WARNING: This is called by initializeEngine() in {@link @xr3ngine/engine/initialize#initializeEngine}
 * (You probably don't want to use this) 
 */
export function execute (delta?: number, time?: number): void {
		// Stats begin
			Engine.stats.begin();
		requestAnimationFrame(() => execute() );

		// Measuring render time
		Engine.renderDelta = Engine.clock.getDelta();

    if (Engine.enabled) {
      Engine.systemsToExecute.forEach(system => (system.enabled && system.fixed !== true) executeSystem(system, Engine.renderDelta, Engine.clock.elapsedTime));
      processDeferredEntityRemoval();
    }

		// Getting timeStep
		let timeStep = Math.min((Engine.renderDelta + Engine.logicDelta), 1 / 10); ;

    // Logic
    if (Engine.enabled) {
      Engine.systemsToExecute.forEach(system => system.enabled && system.fixed !== undefined) executeSystem(system, Engine.logicDelta, Engine.clock.elapsedTime));
      processDeferredEntityRemoval();
    }

		// Measuring logic time
		Engine.logicDelta = Engine.clock.getDelta();

		// Frame limiting
		let interval = 1 / Engine.params.FPS_Limit;
		Engine.sinceLastFrame += Engine.renderDelta + Engine.logicDelta;
		if (Engine.sinceLastFrame > interval)
		{
			Engine.sinceLastFrame %= interval;

			// Stats end
			Engine.stats.end();
      Engine.lastTime = Engine.clock.elapsedTime;
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
  const entitiesToRemove = [];
  const entitiesWithComponentsToRemove = [];
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
