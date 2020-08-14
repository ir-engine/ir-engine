import { Sky } from "three/examples/jsm/objects/Sky"
import { Component } from "../../ecs"

export class Skybox extends Component<Skybox> {
  value: Sky
}
