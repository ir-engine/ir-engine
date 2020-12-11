import { Object3D } from 'three';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class Object3DComponent extends Component<Object3DComponent> {
  value?: Object3D
}

Object3DComponent._schema = {
  value: { type: Types.Ref, default: null }
};
