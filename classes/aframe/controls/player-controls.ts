import AFRAME from 'aframe'
import { ControllerComponent } from './controls'
import LookController from './look-controls'
import WASDController from './wasd-controls'

export interface PlayerControllers {
  readonly [index: string]: ControllerComponent
}

export default class PlayerControls {
  // eslint-disable-next-line no-useless-constructor
  constructor(public controllers = defaultPlayerControllers) {
  }

  setupControls(player: AFRAME.Entity): void {
    if (player.hasLoaded) this.controllers.forEach(controller => this.setController(player, controller))
    else player.addEventListener('loaded', this.setupControlsHandler.bind(this, {} as Event, player))
  }

  setupControlsHandler(evt: Event, player: AFRAME.Entity): void {
    console.log(evt)
    console.log('setupControlsHandler')
    this.controllers.forEach(controller => this.setController(player, controller))
  }

  setController(player: AFRAME.Entity, controller: ControllerComponent): void {
    player.setAttribute(controller.name, controller.options)
  }
}
export const defaultPlayerControllers = [new LookController(), new WASDController()]
