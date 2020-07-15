import { System, Entity } from "ecsy"
import Subscription from "../components/Subscription"
import BehaviorArgValue from "../../common/interfaces/BehaviorValue"
import Behavior from "../../common/interfaces/Behavior"

export default class BehaviorSystem extends System {
  private subscription: Subscription
  public execute(delta: number, time: number): void {
    this.queries.subscriptions.added?.forEach(entity => {
      this.callBehaviorsForHook(entity, { phase: "onAdded" }, delta)
    })

    this.queries.subscriptions.changed?.forEach(entity => {
      this.callBehaviorsForHook(entity, { phase: "onChanged" }, delta)
    })

    this.queries.subscriptions.results?.forEach(entity => {
      this.callBehaviorsForHook(entity, { phase: "onUpdate" }, delta)
      this.callBehaviorsForHook(entity, { phase: "onLateUpdate" }, delta)
    })

    this.queries.subscriptions.removed?.forEach(entity => {
      this.callBehaviorsForHook(entity, { phase: "onRemoved" }, delta)
    })
  }

  // TODO: Make this a generic behavior and move to common
  callBehaviorsForHook: Behavior = (entity: Entity, args: { hook: string }, delta: number) => {
    this.subscription = entity.getComponent(Subscription)
    if (this.subscription.map[args.hook] !== undefined) {
      this.subscription.map[args.hook].forEach((value: BehaviorArgValue) => {
        value.behavior(entity, value.args ? value.args : null, delta)
      })
    }
  }
}

BehaviorSystem.queries = {
  subscriptions: {
    components: [Subscription],
    listen: {
      added: true,
      changed: true,
      removed: true
    }
  }
}
