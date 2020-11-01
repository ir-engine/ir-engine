import { isClient } from "../../common/functions/isClient";
import { DomEventBehaviorValue } from "../../common/interfaces/DomEventBehaviorValue";
import { NumericalType } from "../../common/types/NumericalTypes";
import { Engine } from "../../ecs/classes/Engine";
import { Entity } from "../../ecs/classes/Entity";
import { System } from '../../ecs/classes/System';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from "../../ecs/functions/SystemUpdateType";
import { NetworkObject } from "../../networking/components/NetworkObject";
import { Server } from "../../networking/components/Server";
import { handleInput } from '../behaviors/handleInput';
import { handleInputPurge } from "../behaviors/handleInputPurge";
import { initializeSession, processSession } from '../behaviors/WebXRInputBehaviors';
import { Input } from '../components/Input';
import { LocalInputReceiver } from "../components/LocalInputReceiver";
import { WebXRRenderer } from '../components/WebXRRenderer';
import { WebXRSession } from '../components/WebXRSession';
import { initVR } from '../functions/WebXRFunctions';
import { InputValue } from "../interfaces/InputValue";
import { ListenerBindingData } from "../interfaces/ListenerBindingData";
import { InputAlias } from "../types/InputAlias";
/**
 * Input System
 *
 * Property with prefix readonly makes a property as read-only in the class
 * @property {Number} mainControllerId set value 0
 * @property {Number} secondControllerId set value 1
 * @property {} boundListeners set of values without keys
 */

export class InputSystem extends System {
  updateType = SystemUpdateType.Fixed;
  // Temp/ref variables
  private _inputComponent: Input

  // Client only variables
  readonly mainControllerId //= 0
  readonly secondControllerId //= 1
  private readonly boundListeners //= new Set()
  readonly useWebXR
  readonly onVRSupportRequested
  private entityListeners: Map<Entity, Array<ListenerBindingData>>

  constructor({ useWebXR, onVRSupportRequested }) {
    super();
    // Client only
    if (isClient) {
      console.log("Initing on client")
      this.useWebXR = useWebXR;
      this.onVRSupportRequested = onVRSupportRequested;
      this.mainControllerId = 0;
      this.secondControllerId = 1;
      this.boundListeners = new Set();
      this.entityListeners = new Map();

      if (this.useWebXR) {
        if (this.onVRSupportRequested) {
          initVR(this.onVRSupportRequested);
        } else initVR();
      }
    }
  }

  dispose(): void {
    // disposeVR();
    this._inputComponent = null;
  }

  /**
 *
 * @param {Number} delta Time since last frame
 */
  public execute = isClient ? this.clientExecute : this.serverExecute;

  public clientExecute(delta: number): void {
    // Handle XR input
    if (this.queryResults.xrRenderer.all.length > 0) {
      console.log("XR RENDERING");
      const webXRRenderer = getMutableComponent(this.queryResults.xrRenderer.all[0], WebXRRenderer);
      // Called when WebXRSession component is added to entity
      this.queryResults.xrSession.added?.forEach(entity => initializeSession(entity, { webXRRenderer }));
      // Called every frame on all WebXRSession components
      this.queryResults.xrSession.all?.forEach(entity => processSession(entity));
    }

    // Apply input for local user input onto client
    this.queryResults.localClientInput.all?.forEach(entity => {
      handleInput(entity, {}, delta);
    });


    // Called when input component is added to entity
    this.queryResults.localClientInput.added?.forEach(entity => {
      // Get component reference
      this._inputComponent = getComponent(entity, Input);
      // Call all behaviors in "onAdded" of input map
      this._inputComponent.schema.onAdded.forEach(behavior => {
        behavior.behavior(entity, { ...behavior.args });
      });
      // Bind DOM events to event behavior
      const listenersDataArray: ListenerBindingData[] = [];
      this.entityListeners.set(entity, listenersDataArray);
      Object.keys(this._inputComponent.schema.eventBindings)?.forEach((eventName: string) => {
        this._inputComponent.schema.eventBindings[eventName].forEach((behaviorEntry: DomEventBehaviorValue) => {
          // const domParentElement:EventTarget = document;
          let domParentElement: EventTarget = Engine.viewportElement ?? document;
          if (behaviorEntry.element) {
            switch (behaviorEntry.element) {
              case "window":
                domParentElement = window;
                break;
              case "document":
                domParentElement = document;
                break;
              case "viewport":
              default:
                domParentElement = Engine.viewportElement;
            }
          }

          const domElement = (behaviorEntry.selector && domParentElement instanceof Element) ? domParentElement.querySelector(behaviorEntry.selector) : domParentElement;
          //console.log('InputSystem addEventListener:', eventName, domElement, ' (', behaviorEntry.element, behaviorEntry.selector, ')');

          if (domElement) {
            const listener = (event: Event) => behaviorEntry.behavior(entity, { event, ...behaviorEntry.args });
            domElement.addEventListener(eventName, listener);
            listenersDataArray.push({
              domElement,
              eventName,
              listener
            });
            return [domElement, eventName, listener];
          } else {
            console.warn('DOM Element not found:', domElement);
            return false;
          }
        });
      });
    });

    // Called when input component is removed from entity
    this.queryResults.localClientInput.removed.forEach(entity => {
      // Get component reference
      this._inputComponent = getComponent(entity, Input, true);

      if (this._inputComponent.data.size) {
        this._inputComponent.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
          handleInputPurge(entity);
        });
      }

      // Call all behaviors in "onRemoved" of input map
      this._inputComponent.schema.onRemoved.forEach(behavior => {
        behavior.behavior(entity, behavior.args);
      });
      // Unbind events from DOM
      this.entityListeners.get(entity).forEach(listenerData => listenerData.domElement?.removeEventListener(listenerData.eventName, listenerData.listener));

      const bound = this.boundListeners[entity.id];
      if (bound) {
        for (const [selector, eventName, listener] of bound) {
          const domElement = selector ? document.querySelector(selector) : document;
          domElement?.removeEventListener(eventName, listener);
        }
        delete this.boundListeners[entity.id];
      }

      this.entityListeners.delete(entity);
    });
  }

  public serverExecute(delta: number): void {
    // Apply input for local user input onto client
    this.queryResults.inputOnServer.all?.forEach(entity => {
      handleInput(entity, {}, delta);
    });

    // Called when input component is added to entity
    this.queryResults.inputOnServer.added?.forEach(entity => {
      // Get component reference
      this._inputComponent = getComponent(entity, Input);
      // Call all behaviors in "onAdded" of input map
      this._inputComponent.schema.onAdded.forEach(behavior => {
        behavior.behavior(entity, { ...behavior.args });
      });
    });

    // Called when input component is removed from entity
    this.queryResults.inputOnServer.removed.forEach(entity => {
      // Get component reference
      this._inputComponent = getComponent(entity, Input, true);

      // Call all behaviors in "onRemoved" of input map
      this._inputComponent?.schema?.onRemoved.forEach(behavior => {
        behavior.behavior(entity, behavior.args);
      });
    });
  }
}

  /**
   * Queries must have components attribute which defines the list of components
   */
  InputSystem.queries = {
    localClientInput: {
      components: [Input, LocalInputReceiver],
      listen: {
        added: true,
        removed: true
      }
    },
    inputOnServer: {
      components: [NetworkObject, Input, Server],
      listen: {
        added: true,
        removed: true
      }
    },
    xrRenderer: { components: [WebXRRenderer] },
    xrSession: { components: [WebXRSession], listen: { added: true } }
  };
