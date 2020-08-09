// Singleton component to store reference to camera and scene
import { Types, World } from "ecsy"
import { SingletonComponent } from "./SingletonComponent"

// World data schema
interface PropTypes {
  world: World
}

export class WorldComponent extends SingletonComponent<PropTypes> {
  world: World
}

WorldComponent.schema = {
  world: { type: Types.Ref, default: null }
}
