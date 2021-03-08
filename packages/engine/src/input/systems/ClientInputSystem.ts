import { DomEventBehaviorValue } from "../../common/interfaces/DomEventBehaviorValue";
import { Engine } from "../../ecs/classes/Engine";
import { ClientInputSchema } from "../schema/ClientInputSchema";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { isClient } from "../../common/functions/isClient";
import { NumericalType } from "../../common/types/NumericalTypes";
import { System } from '../../ecs/classes/System';
import { SystemUpdateType } from "../../ecs/functions/SystemUpdateType";
import { Input } from '../components/Input';
import { InputType } from "../enums/InputType";
import { InputValue } from "../interfaces/InputValue";
import { InputAlias } from "../types/InputAlias";

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
  updateType = SystemUpdateType.Fixed;
  needSend = false;
  switchId = 1;
  // Temp/ref variables
  private _inputComponent: Input;
  private useWebXR = false;
  // Client only variables
  public mainControllerId; //= 0
  public secondControllerId; //= 1
  boundListeners: ListenerBindingData[] = [];
  

  constructor({ useWebXR }) {
    super();
    this.useWebXR = useWebXR;
    // Client only
    if (isClient) {
      this.mainControllerId = 0;
      this.secondControllerId = 1;
    }
    ClientInputSchema.onAdded.forEach(behavior => {
      behavior.behavior();
    });
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
            case "viewport":
            default:
              domParentElement = Engine.viewportElement;
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
    
  }
}
