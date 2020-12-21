import _ from "lodash";
import { isClient } from "../../common/functions/isClient";
import { DomEventBehaviorValue } from "../../common/interfaces/DomEventBehaviorValue";
import { NumericalType } from "../../common/types/NumericalTypes";
import { Engine } from "../../ecs/classes/Engine";
import { Entity } from "../../ecs/classes/Entity";
import { System } from '../../ecs/classes/System';
import { Not } from "../../ecs/functions/ComponentFunctions";
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from "../../ecs/functions/SystemUpdateType";
import { Client } from "../../networking/components/Client";
import { Network } from "../../networking/components/Network";
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { NetworkObject } from "../../networking/components/NetworkObject";
import { handleInputOnClient } from '../behaviors/handleInputOnClient';
import { cleanupInput } from '../behaviors/cleanupInput';
import { handleInputPurge } from "../behaviors/handleInputPurge";
import { handleGamepadConnected, handleGamepads } from "../behaviors/GamepadInputBehaviors"
//import { initializeSession, processSession } from '../behaviors/WebXRInputBehaviors';
import { addPhysics, removeWebXRPhysics, updateWebXRPhysics } from '../behaviors/WebXRControllersBehaviors';
import { Input } from '../components/Input';
import { LocalInputReceiver } from "../components/LocalInputReceiver";
import { WebXRSession } from '../components/WebXRSession';
import { XRControllersComponent } from '../components/XRControllersComponent';
import { InputType } from "../enums/InputType";
import { InputValue } from "../interfaces/InputValue";
import { ListenerBindingData } from "../interfaces/ListenerBindingData";
import { InputAlias } from "../types/InputAlias";
import { Vault } from '../../networking/components/Vault';
import { createSnapshot } from '../../networking/functions/NetworkInterpolationFunctions';
import { clientInputModel } from '../../networking/schema/clientInputSchema';

import supportsPassive from "../../common/functions/supportsPassive";
import { BehaviorComponent } from '../../common/components/BehaviorComponent'
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
  public mainControllerId //= 0
  public secondControllerId //= 1
  private readonly boundListeners //= new Set()
  private entityListeners: Map<Entity, Array<ListenerBindingData>>

  constructor() {
    super();
    // Client only
    if (isClient) {
      this.mainControllerId = 0;
      this.secondControllerId = 1;
      this.boundListeners = new Set();
      this.entityListeners = new Map();
    }
  }

  dispose(): void {
    // disposeVR();
  }

  /**
 *
 * @param {Number} delta Time since last frame
 */

  public execute(delta: number): void {
    // Handle XR input
    this.queryResults.controllersComponent.added?.forEach(entity => addPhysics(entity));
    this.queryResults.controllersComponent.all?.forEach(entity => {
      const xRControllers = getComponent(entity, XRControllersComponent)
      if (xRControllers.physicsBody1 !== null && xRControllers.physicsBody2 !== null && this.mainControllerId) {
        this.mainControllerId = xRControllers.physicsBody1;
        this.secondControllerId = xRControllers.physicsBody2;
      }
      updateWebXRPhysics(entity)
    });
    this.queryResults.controllersComponent.removed?.forEach(entity => removeWebXRPhysics(entity, { controllerPhysicalBody1: this.mainControllerId, controllerPhysicalBody2: this.secondControllerId }));

    // Apply input for local user input onto client
    this.queryResults.localClientInput.all?.forEach(entity => {
      // Apply input to local client
      handleGamepads(entity);
      handleInputOnClient(entity, {isLocal:true, isServer: false}, delta);
      const networkId = getComponent(entity, NetworkObject)?.networkId;
      // Client sends input and *only* input to the server (for now)
      // console.log("Handling input for entity ", entity.id);
      const input = getComponent(entity, Input);

      // If input is the same as last frame, return
      // if (_.isEqual(input.data, input.lastData))
      //   return

      // Repopulate lastData
      input.lastData.clear();
      input.data.forEach((value, key) => input.lastData.set(key, value));

      // Create a schema for input to send

      const inputs = {
        networkId: networkId,
        buttons: [],
        axes1d: [],
        axes2d: [],
        viewVector: {
          x:0, y: 0, z :0
        }
      };

      // Add all values in input component to schema
      input.data.forEach((value, key) => {
        if (value.type === InputType.BUTTON)
          inputs.buttons.push({ input: key, value: value.value, lifecycleState: value.lifecycleState });
        else if (value.type === InputType.ONEDIM) // && value.lifecycleState !== LifecycleValue.UNCHANGED
          inputs.axes1d.push({ input: key, value: value.value, lifecycleState: value.lifecycleState });
        else if (value.type === InputType.TWODIM) //  && value.lifecycleState !== LifecycleValue.UNCHANGED
          inputs.axes2d.push({ input: key, valueX: value.value[0], valueY: value.value[1], lifecycleState: value.lifecycleState });
      })



      const actor = getComponent<CharacterComponent>(entity, CharacterComponent)
      inputs.viewVector.x = actor.viewVector.x;
      inputs.viewVector.y = actor.viewVector.y;
      inputs.viewVector.z = actor.viewVector.z;

      if (Network.instance.packetCompression) {
        Network.instance.transport.sendReliableData(clientInputModel.toBuffer(inputs));
      } else {
        Network.instance.transport.sendReliableData(inputs);
      }

    //  const buffer = clientInputModel.toBuffer(inputs)
  //    const inputDebbug = clientInputModel.fromBuffer(buffer)
//     console.warn(inputDebbug);
    //  console.warn(JSON.stringify(inputs).length) // 241
  //    console.warn(message.byteLength) // 56
       // Use default channel

      cleanupInput(entity);

    });

    // Called when input component is added to entity
    this.queryResults.localClientInput.added?.forEach(entity => {
      // Get component reference
      this._inputComponent = getComponent(entity, Input);
      if (this._inputComponent === undefined)
        return console.warn("Tried to execute on a newly added input component, but it was undefined")
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
            if (behaviorEntry.passive && supportsPassive())
            {
              domElement.addEventListener(eventName, listener, {passive: behaviorEntry.passive});
            }
            else
            {
              domElement.addEventListener(eventName, listener);
            }

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
      this._inputComponent = getComponent(entity, Input);
      if (this._inputComponent === undefined)
        return console.warn("Tried to execute on a newly added input component, but it was undefined")
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


    // Called when input component is added to entity
    this.queryResults.networkClientInput.added?.forEach(entity => {
      // Get component reference
      this._inputComponent = getComponent(entity, Input);

      if (this._inputComponent === undefined)
        return console.warn("Tried to execute on a newly added input component, but it was undefined")
      // Call all behaviors in "onAdded" of input map
      this._inputComponent.schema.onAdded?.forEach(behavior => {
        console.log("Added behaviors");
        console.log(behavior.behavior);
        behavior.behavior(entity, { ...behavior.args });
      });
    });


    // Called when input component is removed from entity
    this.queryResults.networkClientInput.removed?.forEach(entity => {
      // Get component reference
      this._inputComponent = getComponent(entity, Input);

      // Call all behaviors in "onRemoved" of input map
      this._inputComponent?.schema?.onRemoved?.forEach(behavior => {
        behavior.behavior(entity, behavior.args);
      });
    });
  }
}

/**
 * Queries must have components attribute which defines the list of components
 */
InputSystem.queries = {
  networkClientInput: {
    components: [NetworkObject, Input, Client, Not(LocalInputReceiver)],
    listen: {
      added: true,
      removed: true
    }
  },
  localClientInput: {
    components: [Input, Client, LocalInputReceiver],
    listen: {
      added: true,
      removed: true
    }
  },
  xrSession: { components: [WebXRSession], listen: { added: true } },
  controllersComponent: { components: [XRControllersComponent], listen: { added: true, removed: true } }
};
