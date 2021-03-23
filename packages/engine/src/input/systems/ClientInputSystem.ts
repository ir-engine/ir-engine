import { DomEventBehaviorValue } from "../../common/interfaces/DomEventBehaviorValue";
import { Engine } from "../../ecs/classes/Engine";
import { ClientInputSchema } from "../schema/ClientInputSchema";
import { System, SystemAttributes } from '../../ecs/classes/System';
import { SystemUpdateType } from "../../ecs/functions/SystemUpdateType";
import { handleGamepads } from "../behaviors/GamepadInputBehaviors";
import { InputType } from "../enums/InputType";
import { InputValue } from "../interfaces/InputValue";
import { NumericalType } from "../../common/types/NumericalTypes";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { InputAlias } from "../types/InputAlias";
import { EngineEvents } from "../../ecs/classes/EngineEvents";

const supportsPassive = (): boolean => {
  let supportsPassiveValue = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: function () {
        supportsPassiveValue = true;
      }
    });
    window.addEventListener("testPassive", null, opts);
    window.removeEventListener("testPassive", null, opts);
  } catch (error) { }
  return supportsPassiveValue;
}

// for future api stuff, we should replace ClientInputSchema with a user given option & default to ClientInputSchema

interface ListenerBindingData {
  domElement: any;
  eventName: string;
  listener: Function;
}

/**
 * Input System
 *
 * Property with prefix readonly makes a property as read-only in the class
 * @property {Number} mainControllerId set value 0
 * @property {Number} secondControllerId set value 1
 */

export class ClientInputSystem extends System {

  static EVENTS = {
    ENABLE_INPUT: 'CLIENT_INPUT_SYSTEM_ENABLE_INPUT',
    PROCESS_INPUT: 'CLIENT_INPUT_SYSTEM_PROCESS_EVENT',
  }

  updateType = SystemUpdateType.Fixed;
  needSend = false;
  switchId = 1;
  boundListeners: ListenerBindingData[] = [];
  onProcessInput: any;
  static mouseInputEnabled = true;
  static keyboardInputEnabled = true;

  constructor(attributes?: SystemAttributes) {
    super(attributes);
    this.onProcessInput = attributes.onProcessInput;
    ClientInputSchema.onAdded.forEach(behavior => {
      behavior.behavior();
    });

    EngineEvents.instance.addEventListener(ClientInputSystem.EVENTS.ENABLE_INPUT, ({ keyboard, mouse }) => {
      if(typeof keyboard !== 'undefined') ClientInputSystem.keyboardInputEnabled = keyboard;
      if(typeof mouse !== 'undefined') ClientInputSystem.mouseInputEnabled = mouse;
    })


    Object.keys(ClientInputSchema.eventBindings)?.forEach((eventName: string) => {
      ClientInputSchema.eventBindings[eventName].forEach((behaviorEntry: DomEventBehaviorValue) => {
        // const domParentElement:EventTarget = document;
        let domParentElement: EventTarget = Engine.viewportElement ?? (document as any);
        if (behaviorEntry.element) {
          switch (behaviorEntry.element) {
            case "window":
              domParentElement = (window as any);
              break;
            case "document":
              domParentElement = (document as any);
              break;
            case "viewport": default:
              domParentElement = Engine.viewportElement;
              break;
          }
        }
        const domElement = domParentElement;
        if (domElement) {
          const listener = (event: Event) => behaviorEntry.behavior({ event, ...behaviorEntry.args });
          if (behaviorEntry.passive && supportsPassive()) {
            domElement.addEventListener(eventName, listener, { passive: behaviorEntry.passive });
          } else {
            domElement.addEventListener(eventName, listener);
          }
          this.boundListeners.push({
            domElement,
            eventName,
            listener
          });
          return [domElement, eventName, listener];
        } else {
          console.warn('DOM Element not found:', domElement);
          return false;
        }
      })
    })
  }

  dispose(): void {
    // disposeVR();
    ClientInputSchema.onRemoved.forEach(behavior => {
      behavior.behavior();
    });
    this.boundListeners.forEach(({ domElement, eventName, listener }) => {
      domElement.removeEventListener(eventName, listener);
    })
  }

  /**
   *
   * @param {Number} delta Time since last frame
   */

  public execute(delta: number): void {
    handleGamepads();
    const newState = new Map();

    Engine.inputState.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
      if (!Engine.prevInputState.has(key)) {
        return;
      }

      if (value.type === InputType.BUTTON) {
        const prevValue = Engine.prevInputState.get(key);
        if (
          prevValue.lifecycleState === LifecycleValue.STARTED &&
          value.lifecycleState === LifecycleValue.STARTED
        ) {
          // auto-switch to CONTINUED
          value.lifecycleState = LifecycleValue.CONTINUED;
          Engine.inputState.set(key, value);
        }
        return;
      }

      if (value.lifecycleState === LifecycleValue.ENDED) {
        // ENDED here is a special case, like mouse position on mouse down
        return;
      }

      value.lifecycleState = JSON.stringify(value.value) === JSON.stringify(Engine.prevInputState.get(key).value)
        ? LifecycleValue.UNCHANGED
        : LifecycleValue.CHANGED;
      Engine.inputState.set(key, value);
    });

    // deep copy
    Engine.inputState.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
      if(!(value.lifecycleState === LifecycleValue.UNCHANGED && Engine.prevInputState.get(key)?.lifecycleState === LifecycleValue.UNCHANGED)) {
        newState.set(key, { type: value.type, value: value.value, lifecycleState: value.lifecycleState });
      }
    });

    EngineEvents.instance.dispatchEvent({ type: ClientInputSystem.EVENTS.PROCESS_INPUT, data: newState });

    Engine.prevInputState.clear();
    Engine.inputState.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
      Engine.prevInputState.set(key, value);
      if (value.lifecycleState === LifecycleValue.ENDED) {
        Engine.inputState.delete(key);
      }
    });
  }
}
