import AFRAME from 'aframe'
import { ControllerComponent } from './controls'
import LookController from './look-controls'
import WASDController from './wasd-controls'

export interface PlayerControllers {
  readonly [index: string]: ControllerComponent
}

export default class PlayerControls {
  // eslint-disable-next-line no-useless-constructor
  constructor(public controllers: ControllerComponent[] = defaultPlayerControllers) {
  }

  setupControls(player: AFRAME.Entity): void {
    if (player.hasLoaded) this.controllers.forEach(controller => this.setController(player, controller))
    else player.addEventListener('loaded', this.setupControlsHandler.bind(this, {} as Event, player))
  }

  teardownControls(player: AFRAME.Entity): void {
    if (player.hasLoaded) this.controllers.forEach(controller => this.removeController(player, controller))
    else player.addEventListener('loaded', this.removeControlsHandler.bind(this, {} as Event, player))
  }

  setupControlsHandler(evt: Event, player: AFRAME.Entity): void {
    this.controllers.forEach(controller => this.setController(player, controller))
  }

  setController(player: AFRAME.Entity, controller: ControllerComponent): void {
    player.setAttribute(controller.name, controller.options)
  }

  removeControlsHandler(evt: Event, player: AFRAME.Entity): void {
    this.controllers.forEach(controller => this.setController(player, controller))
  }

  removeController(player: AFRAME.Entity, controller: ControllerComponent): void {
    player.removeAttribute(controller.name)
  }
}

export const defaultPlayerControllers = [new LookController(), new WASDController()]
