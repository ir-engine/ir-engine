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
    if (player.hasLoaded) this.removeControlsHandler.bind(this, {} as Event, player)// this.controllers.forEach(controller => this.removeController(player, controller))
    else player.addEventListener('loaded', this.removeControlsHandler.bind(this, {} as Event, player))
  }

  setupVRControls (player: AFRAME.Entity): void {
    if (player.hasLoaded) this.setupVRControlsHandler({} as Event, player)
    else player.addEventListener('loaded', this.setupVRControlsHandler.bind(this, {} as Event, player))
  }

  teardownVRControls (player: AFRAME.Entity): void {
    if (player.hasLoaded) this.removeVRControlsHandler({} as Event, player)
    else player.addEventListener('loaded', this.removeVRControlsHandler.bind(this, {} as Event, player))
  }

  setupControlsHandler (evt: Event, player: AFRAME.Entity): void {
    this.controllers.forEach(controller => this.setController(player, controller))
  }

  removeControlsHandler (evt: Event, player: AFRAME.Entity): void {
    this.controllers.forEach(controller => this.removeController(player, controller))
    this.removeVRControlsHandler(evt, player)
  }

  setupVRControlsHandler (evt: Event, player: AFRAME.Entity): void {
    if (this.leftHandController === null || this.rightHandController === null) this.initHandControllers(player)
    this.trackedControllers.forEach(controller => {
      if (controller.options.hand === 'left') this.setController(this.leftHandController, controller)
      else if (controller.options.hand === 'right') this.setController(this.rightHandController, controller)
    })
  }

  removeVRControlsHandler (evt: Event, player: AFRAME.Entity): void {
    console.log('removeVRControlsHandler')
    this.trackedControllers.forEach(controller => {
      if (this.leftHandController !== null) this.removeController(this.leftHandController, controller)
      if (this.rightHandController !== null) this.removeController(this.rightHandController, controller)
    })
  }

  setController (player: AFRAME.Entity, controller: ControllerComponent): void {
    player.setAttribute(controller.name, controller.options)
  }

  removeController (player: AFRAME.Entity, controller: ControllerComponent): void {
    player.removeAttribute(controller.name)
  }

  initHandControllers (player: AFRAME.Entity): void {
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
    } else {
      const leftHandContoller = player.querySelector('#left-hand-controller')
      if (leftHandContoller !== null) player.removeChild(leftHandContoller)
    }

    if (this.rightHandController !== null) {
      player.removeChild(this.rightHandController)
      this.rightHandController = null
    } else {
      const rightHandController = player.querySelector('#right-hand-controller')
      if (rightHandController !== null) player.removeChild(rightHandController)
    }
  }
}

export const defaultPlayerControllers = [new LookController(), new WASDController()]
