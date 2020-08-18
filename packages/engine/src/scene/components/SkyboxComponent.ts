import { Sky } from 'three/examples/jsm/objects/Sky';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class SkyboxComponent extends Component<SkyboxComponent> {
  value: Sky
}

SkyboxComponent.schema = {
  skybox: { type: Types.Ref, default: null }
};
