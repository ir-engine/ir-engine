import { System, Entity } from "ecsy"
import Subscription from "../components/Subscription"
import BehaviorArgValue from "../../common/interfaces/BehaviorValue"
import Behavior from "../../common/interfaces/Behavior"

export default class SubscriptionSystem extends System {
  private subscription: Subscription
  public execute(delta: number): void {
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

  callBehaviorsForHook: Behavior = (entity: Entity, args: { phase: string }, delta: any) => {
    this.subscription = entity.getComponent(Subscription)
    // If the schema for this subscription component has any values in this phase
    if (this.subscription.schema[args.phase] !== undefined) {
      // Foreach value in this phase
      this.subscription.schema[args.phase].forEach((value: BehaviorArgValue) => {
        // Call the behavior with the args supplied in the schema, as well as delta provided here
        value.behavior(entity, value.args ? value.args : null, delta)
      })
    }
  }
}

SubscriptionSystem.queries = {
  subscriptions: {
    components: [Subscription],
    listen: {
      added: true,
      changed: true,
      removed: true
    }
  }
}
