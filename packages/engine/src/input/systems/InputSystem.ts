import { System } from '../../ecs/classes/System';
import { handleInput } from '../behaviors/handleInput';
import { initializeSession, processSession } from '../behaviors/WebXRInputBehaviors';
import { Input } from '../components/Input';
import { WebXRRenderer } from '../components/WebXRRenderer';
import { WebXRSession } from '../components/WebXRSession';
import { DefaultInputSchema } from '../defaults/DefaultInputSchema';
import { initVR } from '../functions/WebXRFunctions';
import { getMutableComponent, getComponent } from '../../ecs/functions/EntityFunctions';
/**
 * Input System
 * 
 * Property with prefix readonly makes a property as read-only in the class
 * @property {Number} mainControllerId set value 0
 * @property {Number} secondControllerId set value 1
 * @property {} boundListeners set of values without keys
 */

export class InputSystem extends System {
  readonly mainControllerId //= 0
  readonly secondControllerId //= 1

  // Temp/ref variables
  private _inputComponent: Input
  private readonly boundListeners //= new Set()

  constructor() {
    super();
    this.mainControllerId = 0;
    this.secondControllerId = 1;
    this.boundListeners = new Set();
  }

  /**
   * Initialization Virtual Reality
   * 
   * @param onVRSupportRequested 
   */
  init(onVRSupportRequested): void {
    if (onVRSupportRequested) {
      initVR(onVRSupportRequested);
    } else initVR();
  }

  /**
   * 
   * @param {Number} delta Time since last frame
   */
  public execute(delta: number): void {
    // Handle XR input
    if (this.queryResults.xrRenderer.all.length > 0) {
      const webXRRenderer = getMutableComponent(this.queryResults.xrRenderer.all[0], WebXRRenderer);
      // Called when WebXRSession component is added to entity
      this.queryResults.xrSession.added.forEach(entity => initializeSession(entity, { webXRRenderer }));
      // Called every frame on all WebXRSession components
      this.queryResults.xrSession.all.forEach(entity => processSession(entity));
    }

    // Called every frame on all input components
    this.queryResults.inputs.all.forEach(entity => handleInput(entity, { delta }));

    // Called when input component is added to entity
    this.queryResults.inputs.added.forEach(entity => {
      // Get component reference
      this._inputComponent = getComponent(entity, Input);
      // If input doesn't have a map, set the default
      if (this._inputComponent.schema === undefined) this._inputComponent.schema = DefaultInputSchema;
      // Call all behaviors in "onAdded" of input map
      this._inputComponent.schema.onAdded.forEach(behavior => {
        behavior.behavior(entity, { ...behavior.args });
      });
      // Bind DOM events to event behavior
      Object.keys(this._inputComponent.schema.eventBindings)?.forEach((eventName: string) => {
        this._inputComponent.schema.eventBindings[eventName].forEach((behaviorEntry: any) => {
          const domElement = behaviorEntry.selector ? document.querySelector(behaviorEntry.selector) : document;
          if (domElement) {
            const listener = (event: Event) => behaviorEntry.behavior(entity, { event, ...behaviorEntry.args });
            domElement.addEventListener(eventName, listener);
            return [domElement, eventName, listener];
          } else {
            console.warn('DOM Element not found:', domElement);
            return false;
          }
        });
      });
    });

    // Called when input component is removed from entity
    this.queryResults.inputs.removed.forEach(entity => {
      // Get component reference
      this._inputComponent = getComponent(entity, Input);
      // Call all behaviors in "onRemoved" of input map
      this._inputComponent.schema.onRemoved.forEach(behavior => {
        behavior.behavior(entity, behavior.args);
      });
      // Unbind events from DOM
      Object.keys(this._inputComponent.schema.eventBindings).forEach((event: string) => {
        this._inputComponent.schema.eventBindings[event].forEach((behaviorEntry: any) => {
          document.removeEventListener(event, e => {
            behaviorEntry.behavior(entity, { event: e, ...behaviorEntry.args });
          });
        });
      });

      const bound = this.boundListeners[entity.id];
      if (bound) {
        for (const [selector, eventName, listener] of bound) {
          const domElement = selector ? document.querySelector(selector) : document;
          domElement?.removeEventListener(eventName, listener);
        }
        delete this.boundListeners[entity.id];
      }
    });
  }
}

/**
 * Queries must have components attribute which defines the list of components
 */
InputSystem.queries = {
  inputs: {
    components: [Input],
    listen: {
      added: true,
      removed: true
    }
  },
  xrRenderer: { components: [WebXRRenderer] },
  xrSession: { components: [WebXRSession], listen: { added: true } }
};
