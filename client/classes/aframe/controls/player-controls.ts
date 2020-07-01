import AFRAME from 'aframe'
import { ControllerComponent } from './controls'
import { TrackedControllerComponent } from './tracked-controls/tracked-controls'
import LookController from './look-controls'
import WASDController from './wasd-controls'
import OculusTouchController from './tracked-controls/oculus-touch-controls'
import EntityCursor from '../camera/entity-cursor'

export interface PlayerControllers {
  readonly [index: string]: ControllerComponent
}

export default class PlayerControls {
  leftHandController: AFRAME.Entity
  rightHandController: AFRAME.Entity
  constructor (public controllers: ControllerComponent[] = defaultPlayerControllers,
    public trackedControllers: TrackedControllerComponent[] = [
      new OculusTouchController({ hand: 'left' }),
      new OculusTouchController({ hand: 'right' })
    ]) {
    this.leftHandController = null
    this.rightHandController = null
  }

  setupControls (player: AFRAME.Entity): void {
    if (player.hasLoaded) this.setupControlsHandler({} as Event, player)
    else player.addEventListener('loaded', this.setupControlsHandler.bind(this, {} as Event, player))
  }

  teardownControls (player: AFRAME.Entity): void {
    if (player.hasLoaded) this.controllers.forEach(controller => this.removeController(player, controller))
    else player.addEventListener('loaded', this.removeControlsHandler.bind(this, {} as Event, player))
  }

  setupControlsHandler (evt: Event, player: AFRAME.Entity): void {
    this.controllers.forEach(controller => this.setController(player, controller))
    if (this.leftHandController === null || this.rightHandController === null) this.intHandControllers(player)
    this.trackedControllers.forEach(controller => {
      if (controller.options.hand === 'left') this.setController(this.leftHandController, controller)
      else if (controller.options.hand === 'right') this.setController(this.rightHandController, controller)
    })
  }

  removeControlsHandler (evt: Event, player: AFRAME.Entity): void {
    this.controllers.forEach(controller => this.removeController(player, controller))
    this.trackedControllers.forEach(controller => {
      this.removeController(this.leftHandController, controller)
      this.removeController(this.rightHandController, controller)
    })
  }

  setController (player: AFRAME.Entity, controller: ControllerComponent): void {
    player.setAttribute(controller.name, controller.options)
  }

  removeController (player: AFRAME.Entity, controller: ControllerComponent): void {
    player.removeAttribute(controller.name)
  }

  intHandControllers (player: AFRAME.Entity): void {
    this.removeHandControllers(player)
    this.leftHandController = new EntityCursor().el
    this.leftHandController.setAttribute('id', 'left-hand-controller')
    player.appendChild(this.leftHandController)

    this.rightHandController = new EntityCursor().el
    this.rightHandController.setAttribute('id', 'right-hand-controller')
    player.appendChild(this.rightHandController)
  }

  removeHandControllers (player: AFRAME.Entity): void {
    if (this.leftHandController !== null) {
      player.removeChild(this.leftHandController)
      this.leftHandController = null
    }

    if (this.rightHandController !== null) {
      player.removeChild(this.rightHandController)
      this.rightHandController = null
    }
  }
}

export const defaultPlayerControllers = [new LookController(), new WASDController()]
