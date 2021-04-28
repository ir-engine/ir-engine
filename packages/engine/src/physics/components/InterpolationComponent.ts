import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { InterpolationInterface } from '../interfaces/InterpolationInterface';

/**
 * @author HydraFire <github.com/HydraFire>
 */

export class InterpolationComponent extends Component<any> {
  lastUpdate = 0
  updateDaley = 1000
  schema: InterpolationInterface;
}

InterpolationComponent._schema = {
  lastUpdate: { type: Types.Number, default: 0 },
  schema: { type: Types.Ref, default: undefined }
};
