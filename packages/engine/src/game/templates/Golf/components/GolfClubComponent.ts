import { Component } from '../../../../ecs/classes/Component';
import { Types } from '../../../../ecs/types/Types';

export class GolfClubComponent extends Component<GolfClubComponent> {

  canDoChipShots: boolean;

  static _schema = {
    canDoChipShots: { default: false, type: Types.Boolean },
  }
}
