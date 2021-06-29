import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export default class LivestreamProxyComponent extends Component<LivestreamProxyComponent> {
  src: string
  static _schema = {
    src: { type: Types.String, default: '' },
  }
}
