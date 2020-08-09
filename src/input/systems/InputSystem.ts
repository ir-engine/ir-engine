import { Entity, System } from "ecsy"
import { LifecycleValue } from "../../common/enums/LifecycleValue"
import { Behavior } from "../../common/interfaces/Behavior"
import { Binary, NumericalType } from "../../common/types/NumericalTypes"
import { Input } from "../components/Input"
import { DefaultInputSchema } from "../defaults/DefaultInputSchema"
import { InputType } from "../enums/InputType"
import { InputValue } from "../interfaces/InputValue"
import { InputAlias } from "../types/InputAlias"
import { WebXRRenderer } from "../components/WebXRRenderer"
import { WebXRSession } from "../components/WebXRSession"
import { initializeSession, processSession, initVR } from "../behaviors/WebXRInputBehaviors"

export class InputSystem extends System {
  readonly mainControllerId = 0
  readonly secondControllerId = 1

  // Temp/ref variables
  private _inputComponent: Input
  // bound DOM listeners should be saved, otherwise they can't be unbound, becouse (f => f) !== (f => f)
  private boundListeners = new Set()

  init(onVRSupportRequested): void {
    if (onVRSupportRequested) initVR(onVRSupportRequested)
    else initVR()
  }

  public execute(delta: number): void {
    // Handle XR input
    const webXRRenderer = this.queries.xrRenderer.results && this.queries.xrRenderer.results[0].getMutableComponent(WebXRRenderer)

    if (this.queries.xrSession.added) for (const entity of this.queries.xrSession.added) initializeSession(entity, { webXRRenderer })

    if (this.queries.xrSession.results) for (const entity of this.queries.xrSession.results) processSession(entity)

    // Called every frame on all input components
    this.queries.inputs.results.forEach(entity => handleInput(entity, { delta }))

    // Called when input component is added to entity
    this.queries.inputs.added.forEach(entity => {
      // Get component reference
      this._inputComponent = entity.getComponent(Input)
      // If input doesn't have a map, set the default
      if (this._inputComponent.schema === undefined) this._inputComponent.schema = DefaultInputSchema
      // Call all behaviors in "onAdded" of input map
      this._inputComponent.schema.onAdded.forEach(behavior => {
        behavior.behavior(entity, { ...behavior.args })
      })
      // Bind DOM events to event behavior
      Object.keys(this._inputComponent.schema.eventBindings)?.forEach((eventName: string) => {
        this._inputComponent.schema.eventBindings[eventName].forEach((behaviorEntry: any) => {
          const domElement = behaviorEntry.selector ? document.querySelector(behaviorEntry.selector) : document
          if (domElement) {
            const listener = (event: Event) => behaviorEntry.behavior(entity, { event, ...behaviorEntry.args })
            domElement.addEventListener(eventName, listener)
            return [domElement, eventName, listener]
          } else {
            console.warn("DOM Element not found:", domElement)
            return false
          }
        })
      })
    })

    // Called when input component is removed from entity
    this.queries.inputs.removed.forEach(entity => {
      // Get component reference
      this._inputComponent = entity.getComponent(Input)
      // Call all behaviors in "onRemoved" of input map
      this._inputComponent.schema.onRemoved.forEach(behavior => {
        behavior.behavior(entity, behavior.args)
      })
      // Unbind events from DOM
      Object.keys(this._inputComponent.schema.eventBindings).forEach((event: string) => {
        this._inputComponent.schema.eventBindings[event].forEach((behaviorEntry: any) => {
          document.removeEventListener(event, e => {
            behaviorEntry.behavior(entity, { event: e, ...behaviorEntry.args })
          })
        })
      })

      const bound = this.boundListeners[entity.id]
      if (bound) {
        for (const [selector, eventName, listener] of bound) {
          const domElement = selector ? document.querySelector(selector) : document
          domElement?.removeEventListener(eventName, listener)
        }
        delete this.boundListeners[entity.id]
      }
    })
  }
}

let input: Input
export const handleInput: Behavior = (entity: Entity, delta: number): void => {
  input = entity.getMutableComponent(Input) as Input
  input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
    // If the input is a button
    if (value.type === InputType.BUTTON) {
      // If the input exists on the input map (otherwise ignore it)
      if (input.schema.inputButtonBehaviors[key] && input.schema.inputButtonBehaviors[key][value.value as number]) {
        // If the lifecycle hasn't been set or just started (so we don't keep spamming repeatedly)
        if (value.lifecycleState === undefined || value.lifecycleState === LifecycleValue.STARTED) {
          // Set the value of the input to continued to debounce
          input.data.set(key, {
            type: value.type,
            value: value.value as Binary,
            lifecycleState: LifecycleValue.CONTINUED
          })
          input.schema.inputButtonBehaviors[key][value.value as number].started?.forEach(element => element.behavior(entity, element.args, delta))
        } else if (value.lifecycleState === LifecycleValue.CONTINUED) {
          input.schema.inputButtonBehaviors[key][value.value as number].continued?.forEach(element => element.behavior(entity, element.args, delta))
        }
      }
    } else if (value.type === InputType.ONED || value.type === InputType.TWOD || value.type === InputType.THREED || value.type === InputType.FOURD) {
      if (input.schema.inputAxisBehaviors[key]) {
        if (value.lifecycleState === undefined || value.lifecycleState === LifecycleValue.STARTED) {
          // Set the value to continued to debounce
          input.data.set(key, {
            type: value.type,
            value: value.value as Binary,
            lifecycleState: LifecycleValue.CONTINUED
          })
          input.schema.inputAxisBehaviors[key].started?.forEach(element => element.behavior(entity, element.args, delta))
        } else if (value.lifecycleState === LifecycleValue.CONTINUED) {
          input.schema.inputAxisBehaviors[key].continued?.forEach(element => element.behavior(entity, element.args, delta))
        }
      }
    } else {
      console.error("handleInput called with an invalid input type")
    }
  })
}

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
}
