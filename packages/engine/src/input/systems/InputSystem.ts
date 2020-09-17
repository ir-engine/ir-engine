import { Entity } from "../../ecs/classes/Entity";
import { System } from '../../ecs/classes/System';
import { getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/EntityFunctions';
import { handleInput } from '../behaviors/handleInput';
import { initializeSession, processSession } from '../behaviors/WebXRInputBehaviors';
import { Input } from '../components/Input';
import { WebXRRenderer } from '../components/WebXRRenderer';
import { WebXRSession } from '../components/WebXRSession';
import { initVR } from '../functions/WebXRFunctions';
import { ListenerBindingData } from "../interfaces/ListenerBindingData";
import { LocalInputReceiver } from "../components/LocalInputReceiver";
import { InputValue } from "../interfaces/InputValue";
import { NumericalType } from "../../common/types/NumericalTypes";
import { InputAlias } from "../types/InputAlias";
import { handleInputPurge } from "../behaviors/handleInputPurge";
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
  readonly useWebXR
  readonly onVRSupportRequested
  private entityListeners:Map<Entity, Array<ListenerBindingData>>

  constructor ({ useWebXR, onVRSupportRequested }) {
    super();
    this.useWebXR = useWebXR;
    this.onVRSupportRequested = onVRSupportRequested;
    this.mainControllerId = 0;
    this.secondControllerId = 1;
    this.boundListeners = new Set();
    this.entityListeners = new Map();
  }

  /**
   * Initialization Virtual Reality
   *
   * @param onVRSupportRequested
   */
  init ({ useWebXR: boolean, onVRSupportRequested:any }): void {
    if (this.useWebXR) {
      if (this.onVRSupportRequested) {
        initVR(this.onVRSupportRequested);
      } else initVR();
    }
  }

  dispose(): void {
    // disposeVR();
    this._inputComponent = null
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
      this.queryResults.xrSession.added?.forEach(entity => initializeSession(entity, { webXRRenderer }));
      // Called every frame on all WebXRSession components
      this.queryResults.xrSession.all.forEach(entity => processSession(entity));
    }

    // Called every frame on all input components
    this.queryResults.inputs.all.forEach(entity => {
      if (!hasComponent(entity, Input)) {
        return
      }
      handleInput(entity, { }, delta)
    });

    // Called when input component is added to entity
    this.queryResults.inputs.added?.forEach(entity => {
      // Get component reference
      this._inputComponent = getComponent(entity, Input);
      // Call all behaviors in "onAdded" of input map
      this._inputComponent.schema.onAdded.forEach(behavior => {
        behavior.behavior(entity, { ...behavior.args });
      });
      // Bind DOM events to event behavior
      const listenersDataArray:ListenerBindingData[] = []
      this.entityListeners.set(entity, listenersDataArray)
      Object.keys(this._inputComponent.schema.eventBindings)?.forEach((eventName: string) => {
        this._inputComponent.schema.eventBindings[eventName].forEach((behaviorEntry: any) => {
          const domElement = behaviorEntry.selector ? document.querySelector(behaviorEntry.selector) : document;
          if (domElement) {
            const listener = (event: Event) => behaviorEntry.behavior(entity, { event, ...behaviorEntry.args });
            domElement.addEventListener(eventName, listener);
            listenersDataArray.push({
              domElement,
              eventName,
              listener
            })
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
      this._inputComponent = getComponent(entity, Input, true);

      if (this._inputComponent.data.size) {
        this._inputComponent.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
          handleInputPurge(entity);
        })
      }

      // Call all behaviors in "onRemoved" of input map
      this._inputComponent.schema.onRemoved.forEach(behavior => {
        behavior.behavior(entity, behavior.args);
      });
      // Unbind events from DOM
      this.entityListeners.get(entity).forEach(listenerData => listenerData.domElement?.removeEventListener(listenerData.eventName, listenerData.listener) )

      const bound = this.boundListeners[entity.id];
      if (bound) {
        for (const [selector, eventName, listener] of bound) {
          const domElement = selector ? document.querySelector(selector) : document;
          domElement?.removeEventListener(eventName, listener);
        }
        delete this.boundListeners[entity.id];
      }

      this.entityListeners.delete(entity)
    });
  }
}

/**
 * Queries must have components attribute which defines the list of components
 */
InputSystem.queries = {
  inputs: {
    components: [Input, LocalInputReceiver],
    listen: {
      added: true,
      removed: true
    }
  },
  xrRenderer: { components: [WebXRRenderer] },
  xrSession: { components: [WebXRSession], listen: { added: true } }
};
