import { Sky } from "@xr3ngine/engine/src/scene/classes/Sky";

import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class SkyboxComponent extends Component<SkyboxComponent> {
  value: Sky
}

SkyboxComponent.schema = {
  value: { type: Types.Ref, default: null }
};
