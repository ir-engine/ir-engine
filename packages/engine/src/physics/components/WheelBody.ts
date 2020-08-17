import { Component } from "../../ecs/classes/Component"
import { Types } from "../../ecs/types/Types"

export class WheelBody extends Component<WheelBody> {
  mass: 1
  scale: [0.2, 0.2, 0.2]
  wheelMesh: 1
  vehicle: any
}
WheelBody.schema = {
  mass: { type: Types.Number, default: 1 },
  scale: { type: Types.Number, default: { x: 0.2, y: 0.1, z: 0.1 } },
  wheelMesh: { type: Types.Number, default: 1 },
  vehicle: { type: Types.Ref, default: null }
}
