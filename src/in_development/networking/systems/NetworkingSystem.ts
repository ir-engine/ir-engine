import { System } from "ecsy"
import NetworkedComponent from "../components/NetworkedComponent"

export default class NetworkingSystem extends System {
  public execute(): void {
    this.queries.actionStateQueue.changed.forEach(entity => {})
  }
}
NetworkingSystem.queries = {
  actionStateQueue: {
    components: [NetworkedComponent],
    listen: { changed: true }
  }
}
