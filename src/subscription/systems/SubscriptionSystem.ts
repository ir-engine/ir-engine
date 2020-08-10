import { Entity, System } from "ecsy"
import { Behavior } from "../../common/interfaces/Behavior"
import { BehaviorValue } from "../../common/interfaces/BehaviorValue"
import { Subscription } from "../components/Subscription"

export class SubscriptionSystem extends System {
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

  callBehaviorsForHook: Behavior = (entity: Entity, args: { phase: string }, delta: any) => {
    this.subscription = entity.getComponent(Subscription)
    // If the schema for this subscription component has any values in this phase
    if (this.subscription.schema[args.phase] !== undefined) {
      // Foreach value in this phase
      this.subscription.schema[args.phase].forEach((value: BehaviorValue) => {
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
