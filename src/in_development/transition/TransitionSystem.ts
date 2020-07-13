// TODO
import { System } from "ecsy"
import Transition from "./TransitionHandler"

export default class TransitionSystem extends System {
  private _transition: Transition
  public execute(delta: number, time: number): void {
    this.queries.transitionQueue.added.forEach(entity => {
      // console.log("Transitioning from " + entity.getComponent(Transition).from + " to " + entity.getComponent(Transition).to)
    })

    this.queries.transitionQueue.results.forEach(entity => {
      this._transition = entity.getComponent(Transition)
      // If timeAlive > duration, remove transition
      // if (this._transition.timeAlive > this._transition.duration) {
      //   entity.removeComponent(Transition)
      // } else {
      //   // Add delta to timeAlive
      //   this._transition.timeAlive += delta
      // }
    })
  }
}

TransitionSystem.queries = {
  transitionQueue: {
    components: [Transition],
    listen: { added: true }
  }
}
