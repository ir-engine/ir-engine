import { Sky } from "three/examples/jsm/objects/Sky"
import { Component } from "../../ecs/classes/Component"

export class SkyboxComponent extends Component<SkyboxComponent> {
  value: Sky
}
