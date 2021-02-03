import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class ColliderComponent extends Component<ColliderComponent> {
  collider: any
  type: string
  mass: number
  position: any
  quaternion: any
  scale: any
  mesh: any
}

ColliderComponent._schema = {
  collider: { type: Types.Ref, default: null },
  type: { type: Types.String, default: 'box' },
  mass: { type: Types.Number, default: 0 },
  position: { type: Types.Ref, default: null },
  quaternion: { type: Types.Ref, default: {x: 0, y: 0, z: 0, w: 0}},
  scale: { type: Types.Ref, default: {x: 1, y: 1, z: 1}},
  mesh: { type: Types.Ref, default: null}
};
