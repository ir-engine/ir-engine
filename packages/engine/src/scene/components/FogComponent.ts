import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class FogComponent extends Component<any> {
    type: any;
    color: any;
    density: any;
    near: any;
    far: any;
}

FogComponent._schema = {
  type: { type: Types.String, default: "disabled" },
  color: { type: Types.String, default: "#FFFFFF" },
  density: { type: Types.Number, default: .0025 },
  near: { type: Types.Number, default: 1 },
  far: { type: Types.Number, default: 1000 }
};
