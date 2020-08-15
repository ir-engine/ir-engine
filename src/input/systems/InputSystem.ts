import { System, World } from "ecsy"
import { Input } from "../components/Input"
import { DefaultInputSchema } from "../defaults/DefaultInputSchema"
import { WebXRRenderer } from "../components/WebXRRenderer"
import { WebXRSession } from "../components/WebXRSession"
import { initializeSession, processSession } from "../behaviors/WebXRInputBehaviors"
import { initVR } from "../functions/WebXRFunctions"
import { handleInput } from "../behaviors/handleInput"


export class InputSystem extends System {
  readonly mainControllerId //= 0
  readonly secondControllerId //= 1

  // Temp/ref variables
  private _inputComponent: Input
  private boundListeners //= new Set()

  constructor(world = new World, atributes={}){
    world.registerComponent(Input)
    world.registerComponent(WebXRRenderer)
    world.registerComponent(WebXRSession)
    super(world, atributes)
    this.mainControllerId = 0
    this.secondControllerId = 1
    this.boundListeners = new Set()
  }

  init(onVRSupportRequested): void {
    if (onVRSupportRequested) initVR(onVRSupportRequested)
    else initVR()
  }

  public execute(delta: number): void {
    // Handle XR input
    const webXRRenderer =
      this.queries.xrRenderer.results.length > 0 &&
      this.queries.xrRenderer.results[0].getMutableComponent(WebXRRenderer)

    this.queries.xrSession.added.forEach(entity => initializeSession(entity, { webXRRenderer }))

    this.queries.xrSession.results.forEach(entity => processSession(entity))

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
