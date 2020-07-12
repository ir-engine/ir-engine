import { System } from "ecsy"
import SubscriptionMap from "../interfaces/SubscriptionData"
import Subscription from "../components/Subscription"
import BehaviorArgValue from "../../common/interfaces/BehaviorValue"

export default class BehaviorSystem extends System {
  private _transformationData: SubscriptionMap
  public execute(delta: number, time: number): void {
    console.log("DataTransformationSystem")
    this.queries.stateHandlers.results.forEach(entity => {
      this._transformationData = entity.getComponent(Subscription).data
      this._transformationData.data.forEach((value: BehaviorArgValue) => {
        Function.call(value.behavior, value.args ? value.args : null, delta)
      })
    })
  }
}

BehaviorSystem.queries = {
  stateHandlers: {
    components: [Subscription]
  }
}
