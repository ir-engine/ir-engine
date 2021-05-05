import { BinaryValue } from "../../common/enums/BinaryValue";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { isClient } from "../../common/functions/isClient";
import { NumericalType, SIXDOFType } from "../../common/types/NumericalTypes";
import { System } from '../../ecs/classes/System';
import { Not } from "../../ecs/functions/ComponentFunctions";
import { getComponent, hasComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from "../../ecs/functions/SystemUpdateType";
import { Network } from "../../networking/classes/Network";
import { Vault } from '../../networking/classes/Vault';
import { NetworkObject } from "../../networking/components/NetworkObject";
import { NetworkClientInputInterface } from "../../networking/interfaces/WorldState";
import { ClientInputModel } from '../../networking/schema/clientInputSchema';
import { CharacterComponent, RUN_SPEED, WALK_SPEED } from "../../templates/character/components/CharacterComponent";
import { Input } from '../components/Input';
import { LocalInputReceiver } from "../components/LocalInputReceiver";
import { XRInputReceiver } from '../components/XRInputReceiver';
import { InputType } from "../enums/InputType";
import { InputValue } from "../interfaces/InputValue";
import { InputAlias } from "../types/InputAlias";
import { BaseInput } from "../enums/BaseInput";
import { ClientNetworkSystem } from "../../networking/systems/ClientNetworkSystem";
import { EngineEvents } from "../../ecs/classes/EngineEvents";
import { ClientInputSystem } from "./ClientInputSystem";

const isBrowser = new Function("try {return this===window;}catch(e){ return false;}");

let faceToInput, lipToInput, WEBCAM_INPUT_EVENTS;

if (isBrowser())
  import("../behaviors/WebcamInputBehaviors").then(imported => {
    faceToInput = imported.faceToInput;
    lipToInput = imported.lipToInput;
    WEBCAM_INPUT_EVENTS = imported.WEBCAM_INPUT_EVENTS;
  });

/**
 * Input System
 *
 * Property with prefix readonly makes a property as read-only in the class
 * @property {Number} leftControllerId set value 0
 * @property {Number} rightControllerId set value 1
 */

export class ActionSystem extends System {
  updateType = SystemUpdateType.Fixed;
  needSend = false;
  switchId = 1;
  // Temp/ref variables
  private _inputComponent: Input;
  private useWebXR = false;
  // Client only variables
  public leftControllerId; //= 0
  public rightControllerId; //= 1
  receivedClientInputs = [];

  constructor({ useWebXR }) {
    super();
    this.useWebXR = useWebXR;
    // Client only
    if (isClient) {
      this.leftControllerId = 0;
      this.rightControllerId = 1;
    }

    EngineEvents.instance.addEventListener(WEBCAM_INPUT_EVENTS.FACE_INPUT, ({ detection }) => {
      faceToInput(Network.instance.localClientEntity, detection);
    });

    EngineEvents.instance.addEventListener(WEBCAM_INPUT_EVENTS.LIP_INPUT, ({ pucker, widen, open }) => {
      lipToInput(Network.instance.localClientEntity, pucker, widen, open);
    });

    EngineEvents.instance.addEventListener(ClientInputSystem.EVENTS.PROCESS_INPUT, ({ data }) => {
      this.receivedClientInputs.push(data)
    });
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
    // this.queryResults.controllersComponent.added?.forEach(entity => addPhysics(entity));

    // this.queryResults.controllersComponent.removed?.forEach(entity => removeWebXRPhysics(entity, {
    //   leftControllerPhysicsBody: this.leftControllerId,
    //   rightControllerPhysicsBody: this.rightControllerId
    // }));

    // TODO: use Vector & Quaternion .toArray & .fromArray to make this faster
    this.queryResults.controllersComponent.all?.forEach(entity => {
      const xrControllers = getComponent(entity, XRInputReceiver);
      const input = getMutableComponent(entity, Input);
      input.data.set(BaseInput.XR_HEAD, {
        type: InputType.SIXDOF,
        value: {
          x: xrControllers.head.position.x,
          y: xrControllers.head.position.y,
          z: xrControllers.head.position.z,
          qW: xrControllers.head.quaternion.w,
          qX: xrControllers.head.quaternion.x,
          qY: xrControllers.head.quaternion.y,
          qZ: xrControllers.head.quaternion.z,
        },
        lifecycleState: LifecycleValue.CHANGED
      })
      input.data.set(BaseInput.XR_LEFT_HAND, {
        type: InputType.SIXDOF,
        value: {
          x: xrControllers.controllerLeft.position.x,
          y: xrControllers.controllerLeft.position.y,
          z: xrControllers.controllerLeft.position.z,
          qW: xrControllers.controllerLeft.quaternion.w,
          qX: xrControllers.controllerLeft.quaternion.x,
          qY: xrControllers.controllerLeft.quaternion.y,
          qZ: xrControllers.controllerLeft.quaternion.z,
        },
        lifecycleState: LifecycleValue.CHANGED
      })
      input.data.set(BaseInput.XR_RIGHT_HAND, {
        type: InputType.SIXDOF,
        value: {
          x: xrControllers.controllerRight.position.x,
          y: xrControllers.controllerRight.position.y,
          z: xrControllers.controllerRight.position.z,
          qW: xrControllers.controllerRight.quaternion.w,
          qX: xrControllers.controllerRight.quaternion.x,
          qY: xrControllers.controllerRight.quaternion.y,
          qZ: xrControllers.controllerRight.quaternion.z,
        },
        lifecycleState: LifecycleValue.CHANGED
      })
    });

    this.queryResults.localClientInput.all?.forEach(entity => {
      // Apply input for local user input onto client
      const receivedClientInput = [...this.receivedClientInputs];
      this.receivedClientInputs = [];
      receivedClientInput?.forEach((stateUpdate) => {

        // Get immutable reference to Input and check if the button is defined -- ignore undefined buttons
        const input = getMutableComponent(entity, Input);

        // key is the input type enu, value is the input value
        stateUpdate.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
          if (input.schema.inputMap.has(key)) {
            input.data.set(input.schema.inputMap.get(key), value);
          }
        });

        input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
          if (!input.prevData.has(key)) {
            return;
          }

          if (value.type === InputType.BUTTON) {
            const prevValue = input.prevData.get(key);
            if (
              prevValue.lifecycleState === LifecycleValue.STARTED &&
              value.lifecycleState === LifecycleValue.STARTED
            ) {
              // auto-switch to CONTINUED
              value.lifecycleState = LifecycleValue.CONTINUED;
              input.data.set(key, value);
            }
            return;

            if (
              prevValue.lifecycleState === LifecycleValue.ENDED &&
              value.lifecycleState === LifecycleValue.STARTED
            ) {
              // auto-switch to CONTINUED
              value.lifecycleState = LifecycleValue.CONTINUED;
              input.data.set(key, value);
            }
            return
          }

          if (value.lifecycleState === LifecycleValue.ENDED) {
            // ENDED here is a special case, like mouse position on mouse down
            return;
          }

          if (input.prevData.has(key)) {
            if (JSON.stringify(value.value) === JSON.stringify(input.prevData.get(key).value)) {
              value.lifecycleState = LifecycleValue.UNCHANGED;
            } else {
              value.lifecycleState = LifecycleValue.CHANGED;
            }
            input.data.set(key, value);
          }
        });

        // For each input currently on the input object:
        input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
          // If the input exists on the input map (otherwise ignore it)
          if (input.schema.inputButtonBehaviors[key]) {
            // If the button is pressed
          //  console.warn(key,['start','continue','end'][value.lifecycleState]);
            if (value.value === BinaryValue.ON) {
              // If the lifecycle hasn't been set or just started (so we don't keep spamming repeatedly)
              if (value.lifecycleState === undefined) value.lifecycleState = LifecycleValue.STARTED;

              if (value.lifecycleState === LifecycleValue.STARTED) {
                // Set the value of the input to continued to debounce
                input.schema.inputButtonBehaviors[key].started?.forEach(element => {
                  element.behavior(entity, element.args, delta)
                });
              } else if (value.lifecycleState === LifecycleValue.CONTINUED) {
                // If the lifecycle equal continued

                input.schema.inputButtonBehaviors[key].continued?.forEach(element =>
                  element.behavior(entity, element.args, delta)
                );
              
              } else {
                console.error('Unexpected lifecycleState', key, value.lifecycleState, LifecycleValue[value.lifecycleState], 'prev', LifecycleValue[input.prevData.get(key)?.lifecycleState]);
              }
            } else {
              input.schema.inputButtonBehaviors[key].ended?.forEach(element =>
                element.behavior(entity, element.args, delta)
              );
            }
          } else if (input.schema.inputAxisBehaviors[key]) {
            // If lifecycle hasn't been set, init it
            if (value.lifecycleState === undefined) value.lifecycleState = LifecycleValue.STARTED;
            switch (value.lifecycleState) {
              case LifecycleValue.STARTED:
                // Set the value to continued to debounce
                input.schema.inputAxisBehaviors[key].started?.forEach(element =>
                  element.behavior(entity, element.args, delta)
                );
                break;
              case LifecycleValue.CHANGED:
                // If the value is different from last frame, update it
                input.schema.inputAxisBehaviors[key].changed?.forEach(element => {
                  element.behavior(entity, element.args, delta);
                });
                break;
              case LifecycleValue.UNCHANGED:
                input.schema.inputAxisBehaviors[key].unchanged?.forEach(element =>
                  element.behavior(entity, element.args, delta)
                );
                break;
              case LifecycleValue.ENDED:
                console.warn("Patch fix, need to handle properly: ", LifecycleValue.ENDED);
                break;
              default:
                console.error('Unexpected lifecycleState', value.lifecycleState, LifecycleValue[value.lifecycleState]);
            }
          }
        });

        // store prevData
        input.prevData.clear();
        input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
          input.prevData.set(key, value);
        });

        // let sendSwitchInputs = false;

        // if (!hasComponent(Network.instance.networkObjects[Network.instance.localAvatarNetworkId].component.entity, LocalInputReceiver) && !this.needSend) {
        //   this.needSend = true;
        //   sendSwitchInputs = true;
        //   this.switchId = getComponent(entity, NetworkObject).networkId;
        //   console.warn('Car id: '+ getComponent(entity, NetworkObject).networkId);
        // } else if (hasComponent(Network.instance.networkObjects[Network.instance.localAvatarNetworkId].component.entity, LocalInputReceiver) && this.needSend) {
        //   this.needSend = false;
        //   sendSwitchInputs = true;
        //   console.warn('Network.instance.userNetworkId: '+ Network.instance.localAvatarNetworkId);
        // }


        //   sendSwitchInputs ? console.warn('switchInputs'):'';
        //cleanupInput(entity);
        // If input is the same as last frame, return
        // if (_.isEqual(input.data, input.lastData))
        //   return;
        // Repopulate lastData
      //  input.lastData.clear();
    //    input.data.forEach((value, key) => input.lastData.set(key, value));


        const inputSnapshot = Vault.instance?.get()
        if (inputSnapshot !== undefined) {
          // Create a schema for input to send
          const inputs: NetworkClientInputInterface = {
            networkId: Network.instance.localAvatarNetworkId,
            buttons: [],
            axes1d: [],
            axes2d: [],
            axes6DOF: [],
            viewVector: {
              x: 0, y: 0, z: 0
            },
            snapShotTime: inputSnapshot.time - Network.instance.timeSnaphotCorrection ?? 0,
            // switchInputs: sendSwitchInputs ? this.switchId : 0,
            characterState: hasComponent(entity, CharacterComponent) ? getComponent(entity, CharacterComponent).state : 0,
            clientGameAction: Network.instance.clientGameAction
          };

          if (Network.instance.clientGameAction.length) {
            Network.instance.clientGameAction = [];
          }
          //console.warn(inputs.snapShotTime);
          // Add all values in input component to schema
          input.data.forEach((value: any, key) => {
            if (value.type === InputType.BUTTON &&
              value.lifecycleState != LifecycleValue.CONTINUED &&
              value.lifecycleState != LifecycleValue.UNCHANGED &&
              value.lifecycleState != LifecycleValue.CHANGED
            )
              inputs.buttons.push({ input: key, value: value.value, lifecycleState: value.lifecycleState });
            else if (value.type === InputType.ONEDIM) // && value.lifecycleState !== LifecycleValue.UNCHANGED
              inputs.axes1d.push({ input: key, value: value.value, lifecycleState: value.lifecycleState });
            else if (value.type === InputType.TWODIM) //  && value.lifecycleState !== LifecycleValue.UNCHANGED
              inputs.axes2d.push({ input: key, value: value.value, lifecycleState: value.lifecycleState });
            else if (value.type === InputType.SIXDOF) { //  && value.lifecycleState !== LifecycleValue.UNCHANGED
              inputs.axes6DOF.push({
                input: key,
                x: value.value.x,
                y: value.value.y,
                z: value.value.z,
                qX: value.value.qX,
                qY: value.value.qY,
                qZ: value.value.qZ,
                qW: value.value.qW,
              });
              // console.log("*********** Pushing 6DOF input from client input system")
            }
          });

          const actor = getComponent(entity, CharacterComponent);
          if (actor) {
            inputs.viewVector.x = actor.viewVector.x;
            inputs.viewVector.y = actor.viewVector.y;
            inputs.viewVector.z = actor.viewVector.z;
          }
          const buffer = ClientInputModel.toBuffer(inputs);
          EngineEvents.instance.dispatchEvent({ type: ClientNetworkSystem.EVENTS.SEND_DATA, buffer }, false, [buffer]);

          input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
            if (value.type === InputType.BUTTON) {
              if (value.lifecycleState === LifecycleValue.ENDED || value.value === BinaryValue.OFF) {
                input.data.delete(key);
              }
            }
          });

        }

      });
    });

    // Called when input component is added to entity
    this.queryResults.localClientInput.added?.forEach(entity => {
      // Get component reference
      this._inputComponent = getComponent(entity, Input);
      if (this._inputComponent === undefined)
        return console.warn("Tried to execute on a newly added input component, but it was undefined");
      // Call all behaviors in "onAdded" of input map
      this._inputComponent.schema.onAdded.forEach(behavior => {
        behavior.behavior(entity, { ...behavior.args });
      });
    });

    // Called when input component is removed from entity
    this.queryResults.localClientInput.removed.forEach(entity => {
      // Get component reference
      this._inputComponent = getComponent(entity, Input);
      if (this._inputComponent === undefined)
        return console.warn("Tried to execute on a newly added input component, but it was undefined");
      if (this._inputComponent.data.size) {
        this._inputComponent.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
          // For each input currently on the input object:
          // If the input is a button
          if (value.type === InputType.BUTTON) {
            // If the input exists on the input map (otherwise ignore it)
            if (this._inputComponent.schema.inputButtonBehaviors[key]) {
              if (value.lifecycleState !== LifecycleValue.ENDED) {
                this._inputComponent.schema.inputButtonBehaviors[key].ended?.forEach(element =>
                  element.behavior(entity, element.args, delta)
                );
              }
              this._inputComponent.data.delete(key);
            }
          }
        });
      }
    });


    // Called when input component is added to entity
    this.queryResults.networkClientInput.added?.forEach(entity => {
      // Get component reference
      this._inputComponent = getComponent(entity, Input);

      if (this._inputComponent === undefined)
        return console.warn("Tried to execute on a newly added input component, but it was undefined");
      // Call all behaviors in "onAdded" of input map
      this._inputComponent.schema.onAdded?.forEach(behavior => {
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
ActionSystem.queries = {
  networkClientInput: {
    components: [NetworkObject, Input, Not(LocalInputReceiver)],
    listen: {
      added: true,
      removed: true
    }
  },
  localClientInput: {
    components: [Input, LocalInputReceiver],
    listen: {
      added: true,
      removed: true
    }
  },
  controllersComponent: { components: [Input, LocalInputReceiver, XRInputReceiver], listen: { added: true, removed: true } }
};
