import { System, Entity } from "ecsy"
import SubscriptionMap from "../interfaces/SubscriptionMap"
import Subscription from "../components/Subscription"
import SubscriptionMapValue from "../interfaces/SubscriptionMapValue"

export default class BehaviorSystem extends System {
  private _transformationData: SubscriptionMap
  public execute(delta: number, time: number): void {
    console.log("DataTransformationSystem")
    this.queries.stateHandlers.results.forEach(entity => {
      this.makeTransformationsFromData(entity, delta)
    })
  }

  private makeTransformationsFromData(entity: Entity, delta: number) {
    this._transformationData = entity.getComponent(Subscription).data
    this._transformationData.data.forEach((value: SubscriptionMapValue) => {
      Function.call(value.behavior, value.args ? value.args : null, delta)
    })
  }
}

BehaviorSystem.queries = {
  stateHandlers: {
    components: [Subscription]
  }
}
